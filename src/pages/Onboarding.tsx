import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { CheckCircle2, Circle, UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

function FileUploadZone({ label, accept, onUpload, file }: { label: string, accept: string, onUpload: (file: File | null) => void, file: File | null }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  if (file) {
    return (
      <div className="mt-4 flex items-center justify-between p-3 bg-white border border-green-200 rounded-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 text-green-600 rounded">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • Uploaded successfully</p>
          </div>
        </div>
        <button onClick={() => onUpload(null)} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "mt-4 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer bg-white",
        isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        accept={accept} 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3">
        <UploadCloud className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

let globalFwLog: File | null = null;
let globalAdLog: File | null = null;
let globalEdrLog: File | null = null;

export default function Onboarding() {
  const [fwLog, setFwLog] = useState<File | null>(globalFwLog);
  const [adLog, setAdLog] = useState<File | null>(globalAdLog);
  const [edrLog, setEdrLog] = useState<File | null>(globalEdrLog);

  const handleUpload = async (type: string, file: File | null, setFileState: (f: File | null) => void) => {
    if (!file) {
      setFileState(null);
      if (type === "fw") globalFwLog = null;
      if (type === "ad") globalAdLog = null;
      if (type === "edr") globalEdrLog = null;
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch(`/api/upload/${type}`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        setFileState(file);
        if (type === "fw") globalFwLog = file;
        if (type === "ad") globalAdLog = file;
        if (type === "edr") globalEdrLog = file;
      } else {
        console.error("Upload failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const steps = [
    {
      id: "fw",
      title: "Map the 'Official Roads' (The Static Twin)",
      desc: "Upload your Firewall Policies and VPC Flow Logs (from AWS/Azure) to populate the Neo4j Graph with 'Allowed Paths.'",
      status: fwLog ? "complete" : "pending",
      time: "4 Hours",
      diff: "Low",
      uploadLabel: "CSV, JSON, or Log files up to 50MB",
      accept: ".csv,.json,.log,.txt",
      file: fwLog,
      setFile: (file: File | null) => handleUpload("fw", file, setFwLog)
    },
    {
      id: "ad",
      title: "Identify the 'Power Players' (Identity Weight)",
      desc: "Upload an export from Active Directory (AD) or Okta. Categorize users into 'Regular,' 'Admin,' and 'Service Account.'",
      status: adLog ? "complete" : "pending",
      time: "1 Hour",
      diff: "Low",
      uploadLabel: "CSV or JSON export up to 10MB",
      accept: ".csv,.json",
      file: adLog,
      setFile: (file: File | null) => handleUpload("ad", file, setAdLog)
    },
    {
      id: "edr",
      title: "Connect the 'Heartbeat' (Real-Time Telemetry)",
      desc: "Upload a sample of EDR (CrowdStrike, SentinelOne) or SIEM (Splunk, Azure Sentinel) logs to calibrate the baseline.",
      status: edrLog ? "complete" : "pending",
      time: "1-2 Days",
      diff: "Medium",
      uploadLabel: "JSON or Log files up to 100MB",
      accept: ".json,.log,.txt",
      file: edrLog,
      setFile: (file: File | null) => handleUpload("edr", file, setEdrLog)
    },
    {
      id: "tag",
      title: "Tag the 'Crown Jewels' (Business Context)",
      desc: "Manually tag your top 5-10 most critical assets (e.g., 'SWIFT-Server', 'SQL-Customer-DB', 'CEO-Laptop').",
      status: "complete",
      time: "30 Minutes",
      diff: "Low",
    },
    {
      id: "shadow",
      title: "Start 'Shadow Mode' (The Calibration Week)",
      desc: "Run the engine for 7 days in Shadow Mode. The AI runs the 2,000 battles and logs what it would have done, but it doesn't actually block anything.",
      status: "complete",
      time: "7 Days",
      diff: "Automatic",
    },
  ];

  const allUploadsComplete = fwLog && adLog && edrLog;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Onboarding Checklist</h2>
        <p className="text-slate-500 mt-2">The 5 steps to plug your data into the engine.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Progress</CardTitle>
          <CardDescription>
            {allUploadsComplete 
              ? "All required logs uploaded. Systems are calibrating." 
              : "Please upload the required logs to complete the setup."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.id} className={cn(
                "flex items-start gap-4 p-5 rounded-lg border transition-colors",
                step.status === "complete" ? "bg-slate-50 border-slate-200" : "bg-white border-blue-200 shadow-sm"
              )}>
                <div className="mt-1">
                  {step.status === "complete" ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-blue-300" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 mt-1">{step.desc}</p>
                  
                  {step.setFile && (
                    <FileUploadZone 
                      label={step.uploadLabel!} 
                      accept={step.accept!} 
                      onUpload={step.setFile} 
                      file={step.file!} 
                    />
                  )}

                  <div className="flex gap-4 mt-4 text-sm font-medium text-slate-500">
                    <span className="bg-white px-2 py-1 rounded border shadow-sm">Time: {step.time}</span>
                    <span className="bg-white px-2 py-1 rounded border shadow-sm">Difficulty: {step.diff}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
