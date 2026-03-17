import logo from "../assets/graphiee-logo.png";

export default function Header() {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        
        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Graphiee Logo" className="h-12" />
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              Graphiee
            </h1>
            <p className="text-xs text-gray-500">
              Conversational AI Dashboard
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}