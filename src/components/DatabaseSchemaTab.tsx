import React, { useState } from "react";
import { DatabaseSchema, DatabaseTable } from "../types";
import {
  Database,
  Plus,
  Key,
  Link2,
  Copy,
  Check,
  Terminal,
} from "lucide-react";

interface DatabaseSchemaTabProps {
  schema: DatabaseSchema | undefined;
}

export default function DatabaseSchemaTab({ schema }: DatabaseSchemaTabProps) {
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(
    null,
  );

  if (!schema || !schema.tables || schema.tables.length === 0) return null;

  const currentTable = selectedTable || schema.tables[0];

  const handleCopySQL = () => {
    // Generate simple SQL representation for copying
    let sql = `-- Database Paradigm: ${schema.databaseParadigm}\n`;
    schema.tables.forEach((table) => {
      sql += `\nCREATE TABLE ${table.tableName} (\n`;
      const fieldsSql = table.fields.map((f) => {
        let line = `  ${f.name} ${f.type.toUpperCase()}`;
        if (f.constraints) line += ` ${f.constraints}`;
        // description as comment
        return `${line} -- ${f.description}`;
      });
      if (table.primaryKey) {
        fieldsSql.push(`  PRIMARY KEY (${table.primaryKey})`);
      }
      table.foreignKeys?.forEach((fk) => {
        fieldsSql.push(
          `  FOREIGN KEY (${fk.field}) REFERENCES ${fk.referencesTable}(${fk.referencesField})`,
        );
      });
      sql += fieldsSql.join(",\n");
      sql += `\n);\n`;
    });

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="database-schema-tab" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5 font-sans">
            <Database className="w-4.5 h-4.5 text-indigo-600" />
            <span>Database Schema &amp; Blueprint</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Architecture paradigm:{" "}
            <span className="text-indigo-600 font-bold">
              {schema.databaseParadigm}
            </span>
          </p>
        </div>

        <button
          onClick={handleCopySQL}
          className="flex items-center gap-1.5 px-3 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white border-2 border-slate-900 rounded-xl transition-all font-semibold font-mono cursor-pointer shadow-xs active:translate-y-0.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>SQL COPIED</span>
            </>
          ) : (
            <>
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>EXPORT SQL SCHEMA</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Table Selector Sidebar */}
        <div className="md:col-span-4 space-y-2">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            DATA MODEL SCHEMAS
          </span>
          <div className="space-y-1.5">
            {schema.tables.map((table) => {
              const isActive = currentTable.tableName === table.tableName;
              return (
                <button
                  key={table.tableName}
                  onClick={() => setSelectedTable(table)}
                  className={`w-full text-left p-3.5 rounded-xl border font-sans transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="block font-bold text-xs">
                    {table.tableName}
                  </span>
                  <span
                    className={`block text-[10px] mt-0.5 line-clamp-1 ${isActive ? "text-indigo-100" : "text-slate-400"}`}
                  >
                    {table.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Table details */}
        <div className="md:col-span-8 bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between min-h-95">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Active Schema Model
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {currentTable.tableName}
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">
                {currentTable.fields.length} Fields
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed italic">
              {currentTable.description}
            </p>

            {/* Fields table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="p-3">Field</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Constraints</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {currentTable.fields.map((f, idx) => {
                    const isPK = currentTable.primaryKey === f.name;
                    const isFK = currentTable.foreignKeys?.some(
                      (fk) => fk.field === f.name,
                    );
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold flex items-center gap-1.5 text-slate-900">
                          {isPK && (
                            <span title="Primary Key">
                              <Key className="w-3 h-3 text-amber-500 shrink-0" />
                            </span>
                          )}
                          {isFK && (
                            <span title="Foreign Key">
                              <Link2 className="w-3 h-3 text-indigo-500 shrink-0" />
                            </span>
                          )}
                          <span>{f.name}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] uppercase">
                            {f.type}
                          </span>
                        </td>
                        <td className="p-3">
                          {f.constraints ? (
                            <span className="text-[11px] text-slate-500 font-sans">
                              {f.constraints}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500 leading-normal">
                          {f.description}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Foreign Keys & indexes block */}
          {((currentTable.foreignKeys && currentTable.foreignKeys.length > 0) ||
            (currentTable.indexes && currentTable.indexes.length > 0)) && (
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
              {currentTable.foreignKeys &&
                currentTable.foreignKeys.length > 0 && (
                  <div className="space-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">
                      Foreign Key Constraints
                    </span>
                    <ul className="space-y-1">
                      {currentTable.foreignKeys.map((fk, idx) => (
                        <li
                          key={idx}
                          className="text-slate-600 flex items-center gap-1"
                        >
                          <Link2 className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>
                            {fk.field} ➔ {fk.referencesTable}(
                            {fk.referencesField})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {currentTable.indexes && currentTable.indexes.length > 0 && (
                <div className="space-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">
                    Indexes Configuration
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentTable.indexes.map((idxVal, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-[9px]"
                      >
                        {idxVal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Database relationships diagram summary text */}
      <div className="bg-slate-900 border-2 border-slate-900 text-slate-100 p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <h4 className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider mb-2 font-mono">
          Relation Constraints &amp; Cardinality Logs
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed font-sans pre-line">
          {schema.relationshipsDescription}
        </p>
      </div>
    </div>
  );
}
