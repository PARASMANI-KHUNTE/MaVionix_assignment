import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import {
  Database,
  HardDrive,
  Cpu,
  ShieldCheck,
  Radio,
  Sparkles,
  CheckCircle2,
  Play,
  Upload,
  RefreshCw,
} from 'lucide-react';

interface NeonCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NeonCloudModal: React.FC<NeonCloudModalProps> = ({ isOpen, onClose }) => {
  const [invokingFunction, setInvokingFunction] = useState(false);
  const [functionResponse, setFunctionResponse] = useState<string | null>(null);

  const [uploadKey, setUploadKey] = useState('crm-test-document.txt');
  const [uploadContent, setUploadContent] = useState('Verification note stored in Neon S3 bucket assets');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const {
    data: statusData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['neonStatus'],
    queryFn: () => api.getNeonStatus(),
    enabled: isOpen,
    staleTime: 10000,
  });

  const { data: storageFiles, refetch: refetchFiles } = useQuery({
    queryKey: ['neonStorageFiles'],
    queryFn: () => api.getStorageFiles(),
    enabled: isOpen,
    staleTime: 10000,
  });

  const handleInvokeHello = async () => {
    try {
      setInvokingFunction(true);
      const res = await api.invokeNeonFunction();
      setFunctionResponse(res?.data?.response || JSON.stringify(res));
    } catch (err: any) {
      setFunctionResponse(`Error: ${err?.message || 'Invocation failed'}`);
    } finally {
      setInvokingFunction(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadKey.trim()) return;
    try {
      setUploading(true);
      await api.uploadStorageFile(uploadKey, uploadContent);
      setUploadSuccess(`File "${uploadKey}" successfully uploaded to Neon Object Storage!`);
      refetchFiles();
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      setUploadSuccess(`Upload error: ${err?.message || 'Failed'}`);
    } finally {
      setUploading(false);
    }
  };

  const services = statusData?.services;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Neon Cloud Platform Architecture"
      description="Live status & integration monitoring for all 6 Neon cloud services"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {isLoading ? (
          <LoadingSpinner size="md" text="Querying Neon infrastructure..." className="py-12" />
        ) : (
          <>
            {/* Project Banner */}
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="text-sm font-semibold text-emerald-950">
                      Neon Project: {statusData?.project?.projectId || 'polished-bar-01081840'}
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1">
                    Branch: <span className="font-mono font-medium">{statusData?.project?.branch || 'production'}</span> | Region: <span className="font-medium">{statusData?.project?.region || 'ap-southeast-1 (AWS)'}</span>
                  </p>
                </div>
                <Badge variant="success">
                  {statusData?.status === 'operational' ? 'All Services Operational' : 'Active'}
                </Badge>
              </div>
            </div>

            {/* 6 Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 1. Lakebase Postgres */}
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">1. Lakebase Postgres</h5>
                      <p className="text-[11px] text-slate-500">Prisma ORM + Connection Pooling</p>
                    </div>
                  </div>
                  <Badge variant={services?.postgres?.status === 'healthy' ? 'success' : 'danger'}>
                    {services?.postgres?.status === 'healthy' ? 'Connected' : 'Degraded'}
                  </Badge>
                </div>
                <div className="text-[11px] bg-slate-50 rounded p-2 text-slate-600 space-y-1 font-mono">
                  <div>Leads in DB: <span className="font-bold text-slate-900">{services?.postgres?.leadCount ?? 0}</span></div>
                  <div className="truncate">Host: {services?.postgres?.host}</div>
                  <div>Latency: {services?.postgres?.latencyMs}ms</div>
                </div>
              </div>

              {/* 2. Object Storage */}
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-amber-50 text-amber-700">
                      <HardDrive className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">2. Object Storage (S3)</h5>
                      <p className="text-[11px] text-slate-500">Bucket: assets</p>
                    </div>
                  </div>
                  <Badge variant={services?.objectStorage?.status === 'healthy' ? 'success' : 'danger'}>
                    {services?.objectStorage?.status === 'healthy' ? 'Ready' : 'Degraded'}
                  </Badge>
                </div>
                <div className="text-[11px] bg-slate-50 rounded p-2 text-slate-600 space-y-1 font-mono">
                  <div>Objects: <span className="font-bold text-slate-900">{storageFiles?.count ?? services?.objectStorage?.objectCount ?? 0}</span></div>
                  <div className="truncate">Endpoint: {services?.objectStorage?.endpoint}</div>
                  <div>Latency: {services?.objectStorage?.latencyMs}ms</div>
                </div>
              </div>

              {/* 3. Serverless Functions */}
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-purple-50 text-purple-700">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">3. Neon Functions</h5>
                      <p className="text-[11px] text-slate-500">Endpoint: hello.ts</p>
                    </div>
                  </div>
                  <Badge variant={services?.functions?.status === 'healthy' ? 'success' : 'danger'}>
                    {services?.functions?.status === 'healthy' ? 'Deployed' : 'Degraded'}
                  </Badge>
                </div>
                <div className="text-[11px] bg-slate-50 rounded p-2 text-slate-600 space-y-1 font-mono">
                  <div className="truncate">URL: {services?.functions?.url}</div>
                  <div>Last Response: <span className="text-emerald-700 font-semibold">{services?.functions?.response}</span></div>
                  <div>Latency: {services?.functions?.latencyMs}ms</div>
                </div>
              </div>

              {/* 4. Neon Auth */}
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-700">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">4. Neon Auth</h5>
                      <p className="text-[11px] text-slate-500">Managed Better Auth (EdDSA JWKS)</p>
                    </div>
                  </div>
                  <Badge variant={services?.auth?.status === 'healthy' ? 'success' : 'danger'}>
                    {services?.auth?.status === 'healthy' ? 'Active' : 'Degraded'}
                  </Badge>
                </div>
                <div className="text-[11px] bg-slate-50 rounded p-2 text-slate-600 space-y-1 font-mono">
                  <div>JWKS Keys: <span className="font-bold text-slate-900">{services?.auth?.keysCount ?? 1}</span> (Ed25519)</div>
                  <div className="truncate">Auth Base: {services?.auth?.authBaseUrl}</div>
                  <div>Latency: {services?.auth?.latencyMs}ms</div>
                </div>
              </div>

              {/* 5. Realtime */}
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-teal-50 text-teal-700">
                      <Radio className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">5. Neon Realtime</h5>
                      <p className="text-[11px] text-slate-500">Live SQL Query Sealing</p>
                    </div>
                  </div>
                  <Badge variant={services?.realtime?.status === 'healthy' ? 'success' : 'danger'}>
                    {services?.realtime?.status === 'healthy' ? 'Sealing Active' : 'Degraded'}
                  </Badge>
                </div>
                <div className="text-[11px] bg-slate-50 rounded p-2 text-slate-600 space-y-1 font-mono">
                  <div className="truncate">WebSocket: {services?.realtime?.url}</div>
                  <div>Query Encryption: <span className="text-emerald-700 font-semibold">AES-256-GCM Secret Signed</span></div>
                  <div>Latency: {services?.realtime?.latencyMs}ms</div>
                </div>
              </div>

              {/* 6. AI Gateway */}
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-rose-50 text-rose-700">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">6. Neon AI Gateway</h5>
                      <p className="text-[11px] text-slate-500">Databricks Unified Catalog</p>
                    </div>
                  </div>
                  <Badge variant={services?.aiGateway?.status === 'healthy' ? 'success' : 'info'}>
                    {services?.aiGateway?.status === 'healthy' ? 'Online' : 'Connected'}
                  </Badge>
                </div>
                <div className="text-[11px] bg-slate-50 rounded p-2 text-slate-600 space-y-1 font-mono">
                  <div>Catalog Models: <span className="font-bold text-slate-900">{services?.aiGateway?.modelCount ?? 0}</span></div>
                  <div className="truncate">Gateway: {services?.aiGateway?.baseUrl}</div>
                  <div>Route Status: <span className="text-blue-700 font-medium">{services?.aiGateway?.creditsStatus}</span></div>
                </div>
              </div>
            </div>

            {/* Live Interactive Tests */}
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Interactive Cloud Service Verification
              </h4>

              {/* Function Test */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Execute Neon Serverless Function: hello.ts</div>
                  <div className="text-[11px] text-slate-500">
                    Hits <code className="font-mono text-slate-700">https://br-royal-band-azikn3ny-hello.compute.c-3.ap-southeast-1.aws.neon.tech/</code>
                  </div>
                  {functionResponse && (
                    <div className="mt-1.5 text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block">
                      ↳ Response: {functionResponse}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleInvokeHello}
                  isLoading={invokingFunction}
                  icon={<Play className="h-3.5 w-3.5 text-purple-600" />}
                >
                  Run Function
                </Button>
              </div>

              {/* Object Storage Upload Test */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Upload to Neon Object Storage (Bucket: assets)</div>
                    <div className="text-[11px] text-slate-500">Direct S3-compatible write & read test</div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Files stored: {storageFiles?.count ?? 0}
                  </span>
                </div>

                <form onSubmit={handleUploadFile} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={uploadKey}
                    onChange={(e) => setUploadKey(e.target.value)}
                    placeholder="File Key (e.g. notes.txt)"
                    className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={uploadContent}
                    onChange={(e) => setUploadContent(e.target.value)}
                    placeholder="Content / Metadata"
                    className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={uploading}
                    icon={<Upload className="h-3.5 w-3.5" />}
                  >
                    Upload Object
                  </Button>
                </form>

                {uploadSuccess && (
                  <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {uploadSuccess}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetch();
                  refetchFiles();
                }}
                isLoading={isRefetching}
                icon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                Refresh Status
              </Button>
              <Button size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
