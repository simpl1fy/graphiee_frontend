import { useState, useEffect, useRef } from "react";
import { Paperclip, SendHorizontal, Table, X } from "lucide-react";
import axios from 'axios';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function Chat() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);

  const [loadingTables, setLoadingTables] = useState(true);
  const [tables, setTables] = useState([]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadDialogVisible, setUploadDialogVisible] = useState(false);

  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get("http://localhost:8081/api/datasets/tables");

        if (Array.isArray(res.data)) {
          setTables(res.data);
        } else {
          setTables([]);
        }
      } catch (err) {
        console.error("Failed to fetch datasets:", err);
        setTables([]);
      } finally {
        setLoadingTables(false);
      }
    };

    fetchTables();
  }, []);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || isUploading) return;

    setFile(selectedFile);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadDialogVisible(true);
    setTimeout(() => setUploadDialogVisible(false), 1500);
    e.target.value = "";

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await axios.post(
        "http://localhost:8081/api/datasets/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;

            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            setUploadProgress(percent);
          },
        }
      );

      const newTable = res.data;

      setTables((prev) => [...prev, newTable]);

      // automatically select uploaded dataset
      setSelectedTable(newTable);

    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    const fakeEvent = { target: { files: [droppedFile], value: "" } };
    handleFileSelect(fakeEvent);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedTable) return;

    const queryText = input;

    const userMsg = {
      id: crypto.randomUUID(),
      text: queryText,
      sender: "user",
      table: {
        id: selectedTable.id,
        name: selectedTable.name,
      },
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:8081/api/query", {
        datasetId: selectedTable.id,
        query: queryText,
      });

      const response = res.data;

      const aiMsg = {
        id: crypto.randomUUID(),
        sender: "ai",
        sql: response.sql,
        chartType: response.chartType,
        chart: {
          labels: response.labels,
          values: response.values,
        },
        data: response.data,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Query failed:", err);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "ai",
          text: "Query execution failed.",
        },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-gray-100 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-blue-100/70 flex items-center justify-center z-50">
          <div className="text-xl font-semibold text-blue-700 border-2 border-dashed border-blue-400 p-10 rounded-lg">
            Drop your CSV file here
          </div>
        </div>
      )}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">

            <h1 className="text-2xl font-semibold text-gray-500 text-center">
              Upload your dataset and ask Graphiee to visualize your data
            </h1>

            {/* Center Chat Box */}
            <div className="flex flex-col gap-2 w-full max-w-2xl bg-white p-3 rounded-xl shadow">

              <div className="flex flex-col gap-2 w-full max-w-2xl bg-white p-3 rounded-xl shadow">

                {/* File Chip */}
                {file && (
                  <div className="flex items-center gap-3 bg-gray-900 text-white px-3 py-2 rounded-lg w-fit">
                    <div className="bg-green-500 p-2 rounded">📊</div>

                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-300">Spreadsheet</span>
                    </div>

                    <button
                      onClick={() => setFile(null)}
                      className="ml-2 text-gray-300 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Input Row */}
                <div className="flex items-center gap-2">

                  {/* Upload */}
                  <label className="cursor-pointer p-2 rounded-lg hover:bg-gray-200">
                    <Paperclip />
                    <input type="file" className="hidden" onChange={handleFileSelect} />
                  </label>

                  {/* Tables */}
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-200"
                  >
                    <Table />
                  </button>

                  {/* Input */}
                  <textarea
                    value={input}
                    rows={1}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Graphiee..."
                    className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Send */}
                  <button
                    onClick={sendMessage}
                    disabled={isUploading}
                    className={`p-2 rounded-lg text-white ${isUploading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                      }`}
                  >
                    <SendHorizontal />
                  </button>

                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`px-4 py-3 rounded-xl max-w-[90%] md:max-w-[70%] shadow-sm
                  ${m.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 border"
                    }`}
                >
                  {m.text && <p>{m.text}</p>}

                  {m.sql && (
                    <pre className="mt-2 text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
                      {m.sql}
                    </pre>
                  )}

                  {/* Bulletproof Data Renderer */}
                  {m.data && (
                    <div className="mt-4 w-full overflow-hidden">
                      
                      {/* CASE 1: 0 Rows Returned */}
                      {m.data.length === 0 ? (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500 italic">
                          Query executed successfully, but returned 0 rows.
                        </div>
                      ) : 
                      
                      /* CASE 2: Single "Normal Value" (1 Row, 1 Column) */
                      m.data.length === 1 && Object.keys(m.data[0]).length === 1 ? (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-xl shadow-sm w-fit">
                          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
                            {Object.keys(m.data[0])[0]}
                          </p>
                          <p className="text-3xl font-bold">
                            {Object.values(m.data[0])[0] !== null ? String(Object.values(m.data[0])[0]) : "N/A"}
                          </p>
                        </div>
                      ) : 
                      
                      /* CASE 3: Multi-Row/Column - Render Chart or Table */
                      (
                        <div className="w-full">
                          {/* Charts (Only render if labels actually exist) */}
                          {m.chartType === "bar" && m.chart?.labels?.length > 0 && (
                            <Bar data={{
                              labels: m.chart.labels,
                              datasets: [{ label: "Result", data: m.chart.values, backgroundColor: "rgba(59,130,246,0.7)" }]
                            }} options={{ responsive: true }} />
                          )}

                          {m.chartType === "line" && m.chart?.labels?.length > 0 && (
                            <Line data={{
                              labels: m.chart.labels,
                              datasets: [{ label: "Result", data: m.chart.values, borderColor: "rgba(59,130,246,1)" }]
                            }} options={{ responsive: true }} />
                          )}

                          {m.chartType === "pie" && m.chart?.labels?.length > 0 && (
                            <Pie data={{
                              labels: m.chart.labels,
                              datasets: [{ 
                                data: m.chart.values,
                                // Added a predefined color palette for the pie chart so segments are distinct
                                backgroundColor: [
                                  'rgba(255, 99, 132, 0.7)',
                                  'rgba(54, 162, 235, 0.7)',
                                  'rgba(255, 206, 86, 0.7)',
                                  'rgba(75, 192, 192, 0.7)',
                                  'rgba(153, 102, 255, 0.7)',
                                  'rgba(255, 159, 64, 0.7)',
                                  'rgba(199, 199, 199, 0.7)',
                                  'rgba(255, 99, 255, 0.7)',
                                  'rgba(99, 255, 132, 0.7)',
                                  'rgba(255, 159, 164, 0.7)'
                                ],
                                borderColor: [
                                  'rgba(255, 99, 132, 1)',
                                  'rgba(54, 162, 235, 1)',
                                  'rgba(255, 206, 86, 1)',
                                  'rgba(75, 192, 192, 1)',
                                  'rgba(153, 102, 255, 1)',
                                  'rgba(255, 159, 64, 1)',
                                  'rgba(199, 199, 199, 1)',
                                  'rgba(255, 99, 255, 1)',
                                  'rgba(99, 255, 132, 1)',
                                  'rgba(255, 159, 164, 1)'
                                ],
                                borderWidth: 1
                              }]
                            }} options={{ responsive: true }} />
                          )}

                          {/* Table (Renders if requested, OR automatically falls back if a chart fails) */}
                          {(m.chartType === "table" || !m.chartType || !m.chart?.labels || m.chart.labels.length === 0) && (
                            <div className="overflow-x-auto w-full border rounded-lg shadow-sm">
                              <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    {Object.keys(m.data[0]).map((key) => (
                                      <th key={key} className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                        {key}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {m.data.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50">
                                      {Object.values(row).map((val, colIndex) => (
                                        <td key={colIndex} className="px-4 py-2 text-gray-800 whitespace-nowrap">
                                          {val !== null ? String(val) : "null"}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      {messages.length > 0 && (
        <div className="p-4 border-t bg-white">
          {selectedTable && (
            <div className="mb-2 flex items-center gap-3 text-sm text-gray-700 rounded-lg bg-blue-50 border border-blue-200 max-w-fit p-3">
              <div className="flex items-center gap-2">
                <Table className="text-blue-500" />
                <span className="font-medium">Using table:</span>
                <span className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {selectedTable.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTable(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-400 text-white hover:bg-blue-500"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* File Upload */}
            <label className="cursor-pointer p-2 rounded-lg hover:bg-gray-200">
              <Paperclip />
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>

            {/* View Tables */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-200"
            >
              <Table />
            </button>

            {/* Input */}
            <textarea
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={isUploading}
              className={`p-2 rounded-lg text-white ${isUploading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
              <SendHorizontal />
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 bg-black/30 z-40"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 overflow-y-auto
        ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">Uploaded Tables</h2>
          <button onClick={() => setDrawerOpen(false)}>
            <X />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">

          {loadingTables && (
            <p className="text-sm text-gray-500">Loading tables...</p>
          )}

          {!loadingTables && tables.length === 0 && (
            <div className="text-sm text-gray-500 text-center mt-6">
              No tables found. Please add a CSV file to start visualizing.
            </div>
          )}

          {!loadingTables &&
            tables.length > 0 &&
            tables.map((table) => (
              <div
                key={table.id}
                className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-50
        ${selectedTable?.id === table.id ? "border-blue-500 bg-blue-50" : ""}`}
                onClick={() => {
                  setSelectedTable(table);
                  setDrawerOpen(false);
                }}
              >
                <p className="font-medium whitespace-normal break-words">{table.name}</p>

                <p className="text-sm text-gray-500 whitespace-normal break-words">{table.tableName}</p>

                <p className="text-xs text-gray-400 mt-1 whitespace-normal break-words">
                  Columns: {table.columns}
                </p>

                <p className="text-xs text-gray-400 whitespace-normal break-words">{table.createdAt}</p>
              </div>
            ))}

        </div>
      </div>

      {/* Upload Progress Dialog */}
      {uploadDialogVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Uploading {file?.name}
            </h3>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {uploadProgress}% complete
            </p>
          </div>
        </div>
      )}
    </div>
  );
}