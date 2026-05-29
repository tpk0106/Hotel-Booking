import "./index.css";
import MenuRoutes from "./routes";

// /* Prevents the body itself from scrolling */"
function App() {
  return (
    <>
      <div className="bg-gray-600 height-full m-0 p-0 overflow-hidden">
        <MenuRoutes />
      </div>
    </>
  );
}

export default App;
