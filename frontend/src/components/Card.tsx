import { DocIcon } from "../icons/DocIcon"
import { ShareIcon } from "../icons/ShareIcon"
import { DeleteIcon } from "../icons/DeleteIcon"
import axios from "axios";

interface CardProps {
    id: number;
    title: string;
    link: string;
    description: string;
    tags: string;
    type: "twitter" | "youtube"; 
    onDelete: (id: number) => void;
    onAlert?: (msg: string) => void;
    onRefresh?: () => void;
}

export function Card({ id, title, link, description, type, onDelete, onRefresh }: CardProps) {

    const deleteContent = async (id: number) => {
        const token = localStorage.getItem("token");  
        if(!token) return;

        try {
            await axios.delete(`http://localhost:3000/api/v1/content/${id}`, {
                headers: {
                  Authorization : `Bearer ${token}`
                }
                });
                onDelete(id);
            } catch (error) {
                console.log("Error deleting content", error);
        }
    }

    return (
        <div className="group relative mx-2 my-4 w-40 h-60 rounded-md bg-white border border-gray-200 transition-all duration-200
                        hover:w-65 hover:h-65 hover:bg-emerald-300 hover:z-5 hover:shadow-xl flex flex-col overflow-visible z-1">
            
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div className="text-gray-500 flex space-x-2 font-normal truncate">
                    <DocIcon />
                    <h3 className="truncate">{title}</h3>
                </div>
                <div className="flex space-x-3">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-500">
                        <ShareIcon />
                    </a>
                    <button className="text-gray-300 hover:text-red-500" onClick={() => {
                            if (confirm("Are you sure you want to delete this?")) {
                                deleteContent(id);
                            }
                            if(onRefresh) onRefresh();
                        }}>
                        <DeleteIcon />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">

                <div className="flex-1 min-h-[120px] overflow-hidden hover:overflow-auto rounded border border-gray-200">
                    {type === "youtube" && (
                        <div className="relative w-full pb-[56.25%]">
                            <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={link.replace("https://youtu.be/", "https://www.youtube.com/embed/")}
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}

                    {type === "twitter" && (
                        <div className="w-full">
                            <blockquote className="twitter-tweet w-full">
                                <a href={link}></a>
                            </blockquote>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-h-[80px] overflow-hidden hover:overflow-auto rounded border border-gray-200 p-2 text-sm text-gray-700 bg-gray-50">
                    {description}
                </div>
            </div>
        </div>
    )
}
