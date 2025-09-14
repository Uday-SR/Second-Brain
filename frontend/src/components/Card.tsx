import { DocIcon } from "../icons/DocIcon"
import { ShareIcon } from "../icons/ShareIcon"
import { DeleteIcon } from "../icons/DeleteIcon"

interface CardProps {
    title: string;
    link: string;
    type: "twitter" | "youtube"; 
}

export function Card({title, link, type}: CardProps) {
    return (
        <div className="mx-2 my-4 rounded-md p-4 bg-white max-w-86 border-gray-200">
            <div className="flex justify-between">
                <div className="text-gray-500 flex space-x-3 font-medium">
                    <div>
                        <DocIcon/>
                    </div>
                    <h3>{title}</h3>
                </div>
                <div className="flex space-x-3">
                    <div className="text-gray-300">
                        <a href={link}>
                            <ShareIcon/>
                        </a>    
                    </div>
                    <div className="text-gray-300">
                        <div><DeleteIcon/></div>
                    </div>
                </div>    
            </div>

            <div className="pt-3 align-center">
                {type === "youtube" && (
                    <div className="relative w-full pb-[56.25%]">
                        <iframe
                        className=" top-0 left-0 w-full h-full"
                        src={link.replace("https://youtu.be/", "https://www.youtube.com/embed/")}
                        frameBorder="0"
                        allowFullScreen
                        ></iframe>
                    </div>
                )}

                {type === "twitter" && <blockquote className="twitter-tweet ">
                <a href={link}></a>
                </blockquote>}
                
            </div>
        </div>
    )
}