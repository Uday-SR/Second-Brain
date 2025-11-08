import { useState } from "react";

interface ContentModalProps {
  onClose: () => void;
}

interface contentProps {
  title: string;
  link: string;
  tags: string;
  userId: number;
  description: string;
  type: "twitter" | "youtube" | "article" | "other";
}

export default function ContentModal({onClose}: ContentModalProps) {

    const [ newContent, setNewContent ] = useState<contentProps>({
        title: "",
        link: "",
        tags: "",
        userId: 0,
        description: "",
        type: "other"
    });
    
    const handleAddContent = async (e: React.FormEvent) => {

      const contentToAdd = { ...newContent };
        
      // logic
    
      setNewContent({
        title: "",
        link: "",
        tags: "",
        userId: 0,
        description: "",
        type: "other"
      });
    } 
    
    return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-[9999]">
      <div className="bg-white text-black rounded-2xl shadow-2xl w-[90%] max-w-md p-6 relative animate-fadeIn">
        
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <form className="flex flex-col space-y-4" onSubmit={async (e) => { await handleAddContent(e); }}>

          <input 
            onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
            type="text"
            placeholder="title"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input 
            onChange={(e) => setNewContent({ ...newContent, link: e.target.value })}
            type="text"
            placeholder="link"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input 
            onChange={(e) => setNewContent({ ...newContent, tags: e.target.value })}
            type="text"
            placeholder="tags"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input 
            onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
            type="text"
            placeholder="description"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select 
            value={newContent.type}
            onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Role</option>
            <option value="twitter">Twitter</option>
            <option value="youtube">Youtube</option>
          </select>

          <button type="submit" className="bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-300" 
>Create</button>

        </form>
      </div>
    </div>
  );
}