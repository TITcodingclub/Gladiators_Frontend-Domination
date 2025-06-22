export default function CookModeView({ steps }) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 col-span-full">
      <h2 className="font-semibold mb-2">Cook Mode</h2>
      <ul className="space-y-3">
        {steps.map((s,i) => <li key={i} className="flex justify-between"><span>{s}</span><button className="text-blue-500">✓</button></li>)}
      </ul>
    </div>
  )
}