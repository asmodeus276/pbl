import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Code, 
  BookOpen, 
  Bot, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Info, 
  HelpCircle, 
  Layers, 
  Cpu, 
  Send,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CPP_SOURCE_CODE = `#include <iostream>
#include <string>
using namespace std;

const int MAX = 10;   // fixed-size arrays: dimensions must stay within MAX

template <typename T>
class Matrix {
private:
    T elements[MAX][MAX];
    int rows, cols;

public:
    Matrix(int r = 0, int c = 0) : rows(r), cols(c) {}

    int getRows() const { return rows; }
    int getCols() const { return cols; }

    // Read matrix elements from the user
    void getData(const string& name) {
        cout << "Enter elements of matrix " << name
             << " (" << rows << " x " << cols << "):\n";
        for (int i = 0; i < rows; i++)
            for (int j = 0; j < cols; j++)
                cin >> elements[i][j];
    }

    // Multiply this matrix (A) with another matrix (B)
    Matrix<T> multiply(const Matrix<T>& B) const {
        Matrix<T> result(rows, B.cols);
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < B.cols; j++) {
                result.elements[i][j] = 0;
                for (int k = 0; k < cols; k++)
                    result.elements[i][j] += elements[i][k] * B.elements[k][j];
            }
        }
        return result;
    }

    // Display the matrix
    void display() const {
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++)
                cout << elements[i][j] << "\\t";
            cout << "\\n";
        }
    }
};

// Read a valid matrix size (1 to MAX)
bool readSize(const string& name, int& r, int& c) {
    cout << "Enter rows and columns of matrix " << name << ": ";
    cin >> r >> c;
    if (r < 1 || c < 1 || r > MAX || c > MAX) {
        cout << "Error: size must be between 1 and " << MAX << ".\\n";
        return false;
    }
    return true;
}

// Same code works for int, float and double
template <typename T>
void runMultiplication() {
    int r1, c1, r2, c2;

    if (!readSize("A", r1, c1)) return;
    if (!readSize("B", r2, c2)) return;

    // Dimension check: columns of A must equal rows of B
    if (c1 != r2) {
        cout << "Error: multiplication not possible (columns of A != rows of B).\\n";
        return;
    }

    Matrix<T> A(r1, c1), B(r2, c2);
    A.getData("A");
    B.getData("B");

    Matrix<T> C = A.multiply(B);

    cout << "\\nFirst matrix:\\n";
    A.display();
    cout << "\\nSecond matrix:\\n";
    B.display();
    cout << "\\nResultant matrix:\\n";
    C.display();
}

int main() {
    int choice;
    cout << "=== Template Based Matrix Multiplier ===\\n";
    cout << "Choose data type:\\n1. int\\n2. float\\n3. double\\nChoice: ";
    cin >> choice;

    switch (choice) {
        case 1: runMultiplication<int>();    break;
        case 2: runMultiplication<float>();  break;
        case 3: runMultiplication<double>(); break;
        default: cout << "Invalid choice.\\n";
    }
    return 0;
}`;

type DataType = 'int' | 'float' | 'double';

export default function App() {
  const [activeTab, setActiveTab] = useState<'lab' | 'code' | 'deep-dive' | 'tutor'>('lab');
  
  // Simulator state
  const [dataType, setDataType] = useState<DataType>('int');
  const [rowsA, setRowsA] = useState<number>(2);
  const [colsA, setColsA] = useState<number>(2);
  const [rowsB, setRowsB] = useState<number>(2);
  const [colsB, setColsB] = useState<number>(2);

  const [matrixA, setMatrixA] = useState<number[][]>([
    [1, 2],
    [3, 4]
  ]);
  const [matrixB, setMatrixB] = useState<number[][]>([
    [5, 6],
    [7, 8]
  ]);

  const [resultMatrix, setResultMatrix] = useState<number[][] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedResultCell, setSelectedResultCell] = useState<{ r: number; c: number } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // AI Tutor state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hello! I am your C++ template and matrix multiplication tutor powered by Gemini. Ask me anything about how `template <typename T>` works, how fixed-size `elements[MAX][MAX]` arrays are stored in memory, or how matrix multiplication $O(N^3)$ loops operate.' }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Update matrices when dimensions change
  useEffect(() => {
    const rA = Math.min(Math.max(rowsA, 1), 10);
    const cA = Math.min(Math.max(colsA, 1), 10);
    const rB = Math.min(Math.max(rowsB, 1), 10);
    const cB = Math.min(Math.max(colsB, 1), 10);

    setMatrixA(prev => {
      const next: number[][] = [];
      for (let i = 0; i < rA; i++) {
        next[i] = [];
        for (let j = 0; j < cA; j++) {
          next[i][j] = prev[i]?.[j] !== undefined ? prev[i][j] : ((i === j) ? 1 : 0);
        }
      }
      return next;
    });

    setMatrixB(prev => {
      const next: number[][] = [];
      for (let i = 0; i < rB; i++) {
        next[i] = [];
        for (let j = 0; j < cB; j++) {
          next[i][j] = prev[i]?.[j] !== undefined ? prev[i][j] : ((i === j) ? 1 : 0);
        }
      }
      return next;
    });

    setResultMatrix(null);
    setErrorMsg(null);
    setSelectedResultCell(null);
  }, [rowsA, colsA, rowsB, colsB]);

  const handleCellChange = (matrix: 'A' | 'B', r: number, c: number, valStr: string) => {
    let val = dataType === 'int' ? parseInt(valStr, 10) : parseFloat(valStr);
    if (isNaN(val)) val = 0;

    if (matrix === 'A') {
      const next = matrixA.map((row, ri) => 
        row.map((cell, ci) => (ri === r && ci === c ? val : cell))
      );
      setMatrixA(next);
    } else {
      const next = matrixB.map((row, ri) => 
        row.map((cell, ci) => (ri === r && ci === c ? val : cell))
      );
      setMatrixB(next);
    }
    setResultMatrix(null);
  };

  const handleTransposeA = () => {
    const newRows = colsA;
    const newCols = rowsA;
    const transposed: number[][] = Array.from({ length: newRows }, (_, r) =>
      Array.from({ length: newCols }, (_, c) => matrixA[c][r])
    );
    setRowsA(newRows);
    setColsA(newCols);
    setMatrixA(transposed);
    setResultMatrix(null);
  };

  const handleMultiply = () => {
    setErrorMsg(null);
    if (colsA !== rowsB) {
      setErrorMsg(`Multiplication error: Columns of Matrix A (${colsA}) must equal Rows of Matrix B (${rowsB}).`);
      setResultMatrix(null);
      return;
    }

    const r = rowsA;
    const c = colsB;
    const kLimit = colsA;

    const res: number[][] = Array.from({ length: r }, () => Array(c).fill(0));

    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        let sum = 0;
        for (let k = 0; k < kLimit; k++) {
          sum += matrixA[i][k] * matrixB[k][j];
        }
        if (dataType === 'int') {
          res[i][j] = Math.round(sum);
        } else if (dataType === 'float') {
          res[i][j] = parseFloat(sum.toFixed(4));
        } else {
          res[i][j] = parseFloat(sum.toFixed(6));
        }
      }
    }

    setResultMatrix(res);
    setSelectedResultCell({ r: 0, c: 0 });
  };

  const handlePreset = (type: 'identity' | 'random' | 'simple') => {
    if (type === 'identity') {
      setRowsA(3); setColsA(3); setRowsB(3); setColsB(3);
      setMatrixA([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]);
      setMatrixB([
        [4, 5, 6],
        [7, 8, 9],
        [1, 2, 3]
      ]);
    } else if (type === 'random') {
      setRowsA(2); setColsA(3); setRowsB(3); setColsB(2);
      setMatrixA([
        [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)],
        [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)]
      ]);
      setMatrixB([
        [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)],
        [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)],
        [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)]
      ]);
    } else {
      setRowsA(2); setColsA(2); setRowsB(2); setColsB(2);
      setMatrixA([
        [2, -1],
        [3, 4]
      ]);
      setMatrixB([
        [1, 2],
        [-2, 3]
      ]);
    }
    setResultMatrix(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CPP_SOURCE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([CPP_SOURCE_CODE], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matrix_multiplier.cpp';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userQ = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userQ }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQ, codeContext: CPP_SOURCE_CODE })
      });
      const data = await res.json();
      if (data.answer) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I received an empty response from the AI tutor.' }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Error connecting to the AI tutor server.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Contract: Brand title | Nav Links | Primary Action */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white whitespace-nowrap">C++ Matrix Engine</h1>
            <p className="text-xs text-slate-400 hidden sm:block">Template-Based Multiplier Lab</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button 
            onClick={() => setActiveTab('lab')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${activeTab === 'lab' ? 'text-indigo-400 border-indigo-500 font-semibold' : 'border-transparent hover:text-slate-200'}`}
          >
            Matrix Lab Simulator
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${activeTab === 'code' ? 'text-indigo-400 border-indigo-500 font-semibold' : 'border-transparent hover:text-slate-200'}`}
          >
            C++ Source Code
          </button>
          <button 
            onClick={() => setActiveTab('deep-dive')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${activeTab === 'deep-dive' ? 'text-indigo-400 border-indigo-500 font-semibold' : 'border-transparent hover:text-slate-200'}`}
          >
            Template Architecture
          </button>
          <button 
            onClick={() => setActiveTab('tutor')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${activeTab === 'tutor' ? 'text-indigo-400 border-indigo-500 font-semibold' : 'border-transparent hover:text-slate-200'}`}
          >
            AI C++ Tutor
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => { setActiveTab('lab'); handleMultiply(); }}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Multiply Now</span>
          </button>
        </div>
      </header>

      {/* Mobile Subheader Navigation */}
      <div className="flex md:hidden items-center justify-around border-b border-slate-800 bg-slate-900 px-2 py-2 text-xs font-medium text-slate-400">
        <button onClick={() => setActiveTab('lab')} className={`py-1 px-2 rounded ${activeTab === 'lab' ? 'bg-indigo-600/20 text-indigo-400' : ''}`}>Lab</button>
        <button onClick={() => setActiveTab('code')} className={`py-1 px-2 rounded ${activeTab === 'code' ? 'bg-indigo-600/20 text-indigo-400' : ''}`}>Code</button>
        <button onClick={() => setActiveTab('deep-dive')} className={`py-1 px-2 rounded ${activeTab === 'deep-dive' ? 'bg-indigo-600/20 text-indigo-400' : ''}`}>Architecture</button>
        <button onClick={() => setActiveTab('tutor')} className={`py-1 px-2 rounded ${activeTab === 'tutor' ? 'bg-indigo-600/20 text-indigo-400' : ''}`}>AI Tutor</button>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8">
        
        {/* TAB 1: MATRIX LAB SIMULATOR */}
        {activeTab === 'lab' && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            {/* Intro banner */}
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Template-Based C++ Engine Simulator</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Test Matrix Multiplication with `int`, `float`, and `double`</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Configure dimensions (up to <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs">MAX = 10</code>), input matrix values, and run multiplication instantly. Click any result cell to inspect its exact dot product formula.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
                <button onClick={() => handlePreset('identity')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer">
                  Identity (3×3)
                </button>
                <button onClick={() => handlePreset('simple')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer">
                  Signed (2×2)
                </button>
                <button onClick={() => handlePreset('random')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer">
                  Random
                </button>
              </div>
            </div>

            {/* Config & Controls Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
              {/* Data Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Data Type (<code className="text-indigo-400">template &lt;typename T&gt;</code>)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['int', 'float', 'double'] as DataType[]).map((dt) => (
                    <button
                      key={dt}
                      onClick={() => setDataType(dt)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${dataType === dt ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
                    >
                      {dt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matrix A Dimensions */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Matrix A Dimensions</span>
                  <span className="text-indigo-400 font-mono">{rowsA} × {colsA}</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Rows:</span>
                    <input 
                      type="number" 
                      min={1} 
                      max={10} 
                      value={rowsA} 
                      onChange={e => setRowsA(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Cols:</span>
                    <input 
                      type="number" 
                      min={1} 
                      max={10} 
                      value={colsA} 
                      onChange={e => setColsA(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Matrix B Dimensions */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Matrix B Dimensions</span>
                  <span className="text-indigo-400 font-mono">{rowsB} × {colsB}</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Rows:</span>
                    <input 
                      type="number" 
                      min={1} 
                      max={10} 
                      value={rowsB} 
                      onChange={e => setRowsB(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Cols:</span>
                    <input 
                      type="number" 
                      min={1} 
                      max={10} 
                      value={colsB} 
                      onChange={e => setColsB(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error or Compatibility Warning */}
            {colsA !== rowsB && (
              <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex items-center gap-3 text-amber-200 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  <strong>Dimension Warning:</strong> Columns of Matrix A (<code className="font-mono text-amber-300">{colsA}</code>) must equal Rows of Matrix B (<code className="font-mono text-amber-300">{colsB}</code>) for multiplication to be possible. Currently <code className="font-mono text-amber-300">{colsA} != {colsB}</code>.
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-center gap-3 text-rose-200 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Input Matrices Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Matrix A Input */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Matrix A ({rowsA} × {colsA})</h3>
                    <p className="text-xs text-slate-400">Enter numeric values for elements</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTransposeA}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Transpose Matrix A (Swap rows and columns)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Transpose (Aᵀ)</span>
                    </button>
                    <span className="text-xs font-mono bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-800/60">
                      Type: {dataType}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto py-2">
                  <div className="inline-grid gap-2" style={{ gridTemplateColumns: `repeat(${colsA}, minmax(0, 1fr))` }}>
                    {matrixA.map((row, r) => 
                      row.map((val, c) => (
                        <input
                          key={`A-${r}-${c}`}
                          type="number"
                          step={dataType === 'int' ? '1' : 'any'}
                          value={val}
                          onChange={e => handleCellChange('A', r, c, e.target.value)}
                          className="w-16 h-12 bg-slate-800 border border-slate-700 rounded-lg text-center font-mono text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Matrix B Input */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Matrix B ({rowsB} × {colsB})</h3>
                    <p className="text-xs text-slate-400">Enter numeric values for elements</p>
                  </div>
                  <span className="text-xs font-mono bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-800/60">
                    Type: {dataType}
                  </span>
                </div>
                <div className="overflow-x-auto py-2">
                  <div className="inline-grid gap-2" style={{ gridTemplateColumns: `repeat(${colsB}, minmax(0, 1fr))` }}>
                    {matrixB.map((row, r) => 
                      row.map((val, c) => (
                        <input
                          key={`B-${r}-${c}`}
                          type="number"
                          step={dataType === 'int' ? '1' : 'any'}
                          value={val}
                          onChange={e => handleCellChange('B', r, c, e.target.value)}
                          className="w-16 h-12 bg-slate-800 border border-slate-700 rounded-lg text-center font-mono text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Multiply Action Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleMultiply}
                disabled={colsA !== rowsB}
                className={`px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-3 shadow-xl transition-all ${colsA === rowsB ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Matrix Multiplication (A × B)</span>
              </button>
            </div>

            {/* Result Matrix Display */}
            {resultMatrix && (
              <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Resultant Matrix C ({rowsA} × {colsB})</h3>
                      <p className="text-xs text-slate-400">Computed via <code className="text-emerald-400">Matrix&lt;T&gt;::multiply()</code></p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Time Complexity: <strong className="text-indigo-400">O(N³)</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Grid output */}
                  <div className="flex justify-center overflow-x-auto p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="inline-grid gap-2" style={{ gridTemplateColumns: `repeat(${colsB}, minmax(0, 1fr))` }}>
                      {resultMatrix.map((row, r) => 
                        row.map((val, c) => (
                          <button
                            key={`C-${r}-${c}`}
                            onClick={() => setSelectedResultCell({ r, c })}
                            className={`w-16 h-14 rounded-lg font-mono text-sm font-semibold flex items-center justify-center transition-all border cursor-pointer ${selectedResultCell?.r === r && selectedResultCell?.c === c ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/40 scale-105' : 'bg-slate-800 border-slate-700 text-emerald-300 hover:bg-slate-700'}`}
                            title={`Click to inspect C[${r}][${c}]`}
                          >
                            {val}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Step by step dot product breakdown */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-400" />
                        <span>Dot Product Inspector</span>
                      </h4>
                      {selectedResultCell && (
                        <span className="text-xs font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-900">
                          C[{selectedResultCell.r}][{selectedResultCell.c}]
                        </span>
                      )}
                    </div>

                    {selectedResultCell ? (
                      <div className="flex flex-col gap-3 text-xs text-slate-300">
                        <p className="text-slate-400">
                          Formula for row <strong className="text-white">{selectedResultCell.r}</strong> of Matrix A and col <strong className="text-white">{selectedResultCell.c}</strong> of Matrix B:
                        </p>
                        <div className="p-3 bg-slate-900 rounded-lg font-mono text-indigo-200 border border-slate-800 overflow-x-auto">
                          {Array.from({ length: colsA }).map((_, k) => (
                            <span key={k}>
                              ({matrixA[selectedResultCell.r][k]} × {matrixB[k][selectedResultCell.c]})
                              {k < colsA - 1 ? ' + ' : ''}
                            </span>
                          ))}
                          <span className="text-emerald-400 font-bold"> = {resultMatrix[selectedResultCell.r][selectedResultCell.c]}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          In C++ implementation, this corresponds to the inner loop: <code className="text-indigo-300 font-mono">result.elements[i][j] += elements[i][k] * B.elements[k][j];</code>
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Click any cell in the resultant matrix C above to view its dot product calculation breakdown.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: C++ SOURCE CODE */}
        {activeTab === 'code' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-1">C++ Source Code Studio</h2>
                <p className="text-sm text-slate-400">Complete, production-ready C++ implementation with templates and fixed-size `MAX = 10` arrays.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .cpp</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                  <span className="ml-2 text-slate-300">matrix_multiplier.cpp</span>
                </span>
                <span>C++17 / Template Metaprogramming</span>
              </div>
              <div className="p-6 overflow-x-auto max-h-[600px] font-mono text-xs leading-relaxed text-indigo-100">
                <pre className="whitespace-pre">{CPP_SOURCE_CODE}</pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEMPLATE ARCHITECTURE & DEEP DIVE */}
        {activeTab === 'deep-dive' && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white mb-1">C++ Template & Architecture Deep Dive</h2>
              <p className="text-sm text-slate-400">Understanding the core design patterns, type safety, and memory management in this prototype.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Templates */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Class Templates (<code className="text-indigo-400">template &lt;typename T&gt;</code>)</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  C++ templates enable generic programming. By parameterizing the class <code className="text-indigo-300 font-mono">Matrix&lt;T&gt;</code>, the exact same class definition and algorithm work seamlessly for <code className="text-indigo-300 font-mono">int</code>, <code className="text-indigo-300 font-mono">float</code>, <code className="text-indigo-300 font-mono">double</code>, or even user-defined numeric types without code duplication.
                </p>
              </div>

              {/* Card 2: Fixed-Size Array Constraint */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Fixed-Size Arrays (<code className="text-violet-400">const int MAX = 10</code>)</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  The matrix uses static stack allocation <code className="text-violet-300 font-mono">T elements[MAX][MAX]</code>. This ensures fast memory access on the stack without heap allocation overhead (<code className="text-violet-300 font-mono">new</code> / <code className="text-violet-300 font-mono">delete</code>), keeping dimensions bounded within <code className="text-violet-300 font-mono">1 to MAX</code>.
                </p>
              </div>

              {/* Card 3: Multiplication Algorithm */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Multiplication Algorithm (<span className="text-emerald-400">O(N³)</span>)</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  The triple-nested loop computes each element <code className="text-emerald-300 font-mono">C[i][j]</code> as the dot product of row <code className="text-emerald-300 font-mono">i</code> from Matrix A and column <code className="text-emerald-300 font-mono">j</code> from Matrix B. The dimension check <code className="text-emerald-300 font-mono">c1 == r2</code> is strictly validated prior to computation.
                </p>
              </div>

              {/* Card 4: Extensibility */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-800/40 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Extending the Prototype</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  This prototype can be easily extended to support operator overloading (<code className="text-amber-300 font-mono">operator*</code>), matrix transposition, determinant calculation, or dynamic memory allocation using <code className="text-amber-300 font-mono">std::vector&lt;std::vector&lt;T&gt;&gt;</code> for arbitrary dimensions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI C++ TUTOR */}
        {activeTab === 'tutor' && (
          <div className="flex flex-col gap-6 animate-fadeIn max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white mb-1">AI C++ Template & Math Tutor</h2>
              <p className="text-sm text-slate-400">Ask questions about C++ template syntax, object-oriented matrix design, or algorithmic optimizations.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[550px]">
              {/* Chat messages container */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none'}`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 shrink-0 font-bold text-xs">
                        You
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                      <Bot className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-slate-800 border border-slate-700/80 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-400">
                      Thinking about your C++ question...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask a question about C++ templates, matrix multiplication, or operator overloading..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-8 text-center text-xs text-slate-500">
        <p>Templated C++ Matrix Engine & Visual Lab · Built with React, Tailwind CSS, Express & Gemini AI</p>
      </footer>
    </div>
  );
}
