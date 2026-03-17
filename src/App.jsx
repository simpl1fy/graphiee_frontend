import Header from "./components/Header"
import Chat from "./components/Chat"
export default function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 min-h-0">
        <Chat />
      </div>
    </div>
  )
}