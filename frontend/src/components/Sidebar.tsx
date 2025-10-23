import { Logo } from "../icons/Logo"
import { TweetIcon } from "../icons/TweetIcon"
import { YoutubeIcon } from "../icons/YoutubeIcon"
import { DocIcon } from "../icons/DocIcon"
import { LinkIcon } from "../icons/LinkIcon"
import { LeftArrow } from "../icons/LeftArrow"
import { RightArrow } from "../icons/RightArrow"
import { Hashtag } from "../icons/Hashtag"
import { Setting } from "../icons/Setting"
import { Help } from "../icons/Help"

interface SidebarProps {
    expanded: boolean;
    toggleSidebar: () => void;
}

export function Sidebar({ expanded, toggleSidebar }: SidebarProps) {
    return (
        <div className={`h-screen bg-white border-r left-0 top-0 fixed ${expanded ? "w-60" : "w-21"}`}>
            <div className="flex">
                <div className="">
                    <Logo />
                </div>

                {expanded && (
                    <div className="font-medium mt-10 text-2xl italic font-serif">
                        ReMind
                    </div>
                )}

                <button onClick={toggleSidebar} className="ml-8 mt-2 hover:text-cyan-300 ">
                    {expanded ? <LeftArrow/> : <RightArrow/>}
                </button>

            </div>

            <div className="mx-5 mt-3 px-3 text-1xl">
                <ul className="text-stone-500">
                    <li className="py-2 flex pb-5">
                        <div className=""><TweetIcon/></div>
                        {expanded && <div className="mt-1">
                            Tweets
                        </div> }   
                    </li>

                    <li className="py-2 flex pb-5">
                        <div><YoutubeIcon/></div>
                        {expanded && <div className="mt-1 ">
                            Videos
                        </div> }    
                    </li>

                    <li className="py-1 flex pb-5">
                        <div className="text-black pt-2 pr-3"><DocIcon/></div>
                        {expanded && <div className="mt-2">
                            Documents
                        </div> }    
                    </li>

                    <li className="py-3 flex pb-5">
                        <div className="text-black mr-1 pr-1"><LinkIcon/></div>
                        {expanded && <div className="pl-1">
                            Links
                        </div> }    
                    </li>

                    <li className="py-2 flex">
                        <div className="text-black mr-2 pr-1"><Hashtag/> </div>
                        {expanded && <div className="">
                            Tags
                        </div> }     
                    </li>
                </ul>
            </div>

            <div className="my-5 mx-3 border-t">
                <div className="mt-7 mx-5 flex">
                    <div><Setting/></div>
                    {expanded && <div className="ml-4 text-gray-500">
                        Settings
                    </div> }
                </div>
                <div className="mt-4 mx-5 flex">
                    <div><Help/></div>
                    {expanded && <div className="ml-4 text-gray-500">
                        Help
                    </div> }
                </div>
            </div>
        </div> 
    )
}