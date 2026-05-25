import React, { useState } from "react";
import { APISpecification, APIEndpoint } from "../types";
import { Network, Link2, Copy, Check, ShieldCheck, ShieldAlert, Key } from "lucide-react";

interface APISpecificationTabProps {
  apiSpec: APISpecification | undefined;
}

export default function APISpecificationTab({ apiSpec }: APISpecificationTabProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);

  if (!apiSpec || !apiSpec.endpoints || apiSpec.endpoints.length === 0) return null;

  const currentEndpoint = selectedEndpoint || apiSpec.endpoints[0];

  const handleCopyPath = (endpoint: APIEndpoint) => {
    const fullUrl = `${apiSpec.baseUrl}${endpoint.path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(endpoint.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "POST":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "PATCH":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "DELETE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div id="api-specification-tab" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5 font-sans">
            <Network className="w-4.5 h-4.5 text-indigo-600" />
            <span>REST API Endpoint Blueprint</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Gateway Server Base URL: <span className="text-indigo-600 font-mono font-bold">{apiSpec.baseUrl}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Endpoints menu selector */}
        <div className="md:col-span-5 space-y-2">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">GATEWAY PORT ROUTES</span>
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
            {apiSpec.endpoints.map((ep) => {
              const isActive = currentEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 font-sans transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? "bg-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                      : "bg-slate-50/70 text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${getMethodBadge(ep.method)}`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800 truncate" title={ep.path}>{ep.path}</span>
                    </div>
                    <span className="block text-[10px] text-slate-400 line-clamp-1">
                      {ep.description}
                    </span>
                  </div>
                  {ep.authenticationRequired ? (
                    <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Auth Required" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Endpoint detail block */}
        <div className="md:col-span-7 bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-2 py-0.5 rounded border ${getMethodBadge(currentEndpoint.method)}`}>
                  {currentEndpoint.method}
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">{currentEndpoint.path}</span>
              </div>
              <button
                onClick={() => handleCopyPath(currentEndpoint)}
                className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedId === currentEndpoint.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied URL</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Route</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">{currentEndpoint.description}</p>

            {/* Authentication note */}
            <div className={`p-3.5 rounded-xl border flex gap-3 text-xs mb-3.5 font-sans ${
              currentEndpoint.authenticationRequired 
                ? "bg-amber-50 border-amber-200 text-amber-800" 
                : "bg-emerald-50/60 border-emerald-100 text-emerald-800"
            }`}>
              {currentEndpoint.authenticationRequired ? (
                <>
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold">Authentication Guard Required</span>
                    <span className="block text-[11px] text-amber-600 mt-0.5">Standard Bearer OAuth JWT token needs to be parsed in the Authorized request header.</span>
                  </div>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Public Endpoint Route</span>
                    <span className="block text-[11px] text-emerald-600/80 mt-0.5">Does not require access limits or verification headers to query indices.</span>
                  </div>
                </>
              )}
            </div>

            {/* Query parameters if any */}
            {currentEndpoint.queryParams && currentEndpoint.queryParams.length > 0 && (
              <div className="mt-4 mb-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Query Parameters</span>
                <div className="border border-slate-100 rounded-xl overflow-hidden font-sans">
                  <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
                    <tr className="bg-slate-50 text-slate-500 font-bold">
                      <th className="p-2">Param</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Required</th>
                    </tr>
                    {currentEndpoint.queryParams.map((param, idx) => (
                      <tr key={idx} className="border-b border-slate-50">
                        <td className="p-2 font-mono font-bold text-slate-900">{param.name}</td>
                        <td className="p-2"><span className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">{param.type}</span></td>
                        <td className="p-2">
                          <span className={`font-bold ${param.required ? "text-rose-600" : "text-slate-400"}`}>
                            {param.required ? "YES" : "NO"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </table>
                </div>
              </div>
            )}

            {/* Request body info */}
            {currentEndpoint.requestBody && (
              <div className="mt-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Sample Request Body</span>
                <pre className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-mono overflow-x-auto text-slate-700 max-h-[140px] custom-scrollbar">
                  {currentEndpoint.requestBody}
                </pre>
              </div>
            )}
          </div>

          {/* Success response preview */}
          <div className="mt-5 pt-3 border-t border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Response Schema (200 OK)</span>
            <pre className="bg-indigo-950/90 text-indigo-100 border-2 border-slate-900 rounded-xl p-4 text-[10px] font-mono overflow-x-auto max-h-[160px] custom-scrollbar shadow-inner">
              {currentEndpoint.successResponse}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
