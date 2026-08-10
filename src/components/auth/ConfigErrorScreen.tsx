export function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#fff9f3] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-3xl border-[3px] border-orange-100 bg-white p-8 shadow-sm text-center">
        <h1 className="text-xl font-bold text-[#1d1d1d] mb-3">App configuration needed</h1>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <p className="text-xs text-gray-500">
          Copy <code className="text-educture-orange">.env.example</code> to{' '}
          <code className="text-educture-orange">.env</code>, add your keys, save the file, then
          restart <code className="text-educture-orange">npm run dev</code>.
        </p>
      </div>
    </div>
  )
}
