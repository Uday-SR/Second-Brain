import { DocIcon } from "../icons/DocIcon"
import { ShareIcon } from "../icons/ShareIcon"
import { DeleteIcon } from "../icons/DeleteIcon"

interface CardProps {
    title: string;
    link: string;
    description: string;
    type: "twitter" | "youtube"; 
}

export function Card({ title, link, description, type }: CardProps) {
    return (
        <div className="group relative mx-2 my-4 w-40 h-60 rounded-md bg-white border border-gray-200 transition-all duration-200
                        hover:w-80 hover:h-90 hover:bg-emerald-300 hover:z-5 hover:shadow-xl flex flex-col overflow-visible z-1">
            
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div className="text-gray-500 flex space-x-2 font-normal truncate">
                    <DocIcon />
                    <h3 className="truncate">{title}</h3>
                </div>
                <div className="flex space-x-3">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-500">
                        <ShareIcon />
                    </a>
                    <button className="text-gray-300 hover:text-red-500">
                        <DeleteIcon />
                    </button>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">

                {/* Link Embed */}
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

                {/* Description Box */}
                <div className="flex-1 min-h-[80px] overflow-hidden hover:overflow-auto rounded border border-gray-200 p-2 text-sm text-gray-700 bg-gray-50">
                    {description}jpjpbujbpuibib
                </div>
            </div>
        </div>
    )
}
