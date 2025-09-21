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
import { useState } from "react"

export function Sidebar() {
    const [expanded, isExpanded] = useState("");
    return (
        <div className="h-screen bg-white w-76 border-r left-0 top-0 fixed">
            <div className="flex">
                <div>
                    <Logo/>
                </div>

                <div className="font-medium mt-10 text-2xl italic font-serif">
                    ReMind
                </div>

                <div className="ml-15 mt-10 hover:text-cyan-300 ">
                    {expanded ? <RightArrow/> : <LeftArrow/>}
                </div>

            </div>

            <div className="mx-5 mt-3 px-3 text-1xl">
                <ul className="text-stone-500">
                    <li className="py-2 flex pb-5">
                        <div><TweetIcon/></div>
                        <div className="mt-1">
                            Tweets
                        </div>    
                    </li>

                    <li className="py-2 flex pb-5">
                        <YoutubeIcon/>
                        <div className="mt-1">
                            Videos
                        </div>    
                    </li>

                    <li className="py-2 flex pb-5">
                        <div className="text-black pt-2 pr-4"><DocIcon/></div>
                        <div className="mt-1">
                            Documents
                        </div>    
                    </li>

                    <li className="py-3 flex pb-5">
                        <div className="text-black mr-1 pr-1"><LinkIcon/></div>
                        <div className="pl-2">
                            Links
                        </div>    
                    </li>

                    <li className="py-2 flex">
                        <div className="text-black mr-3 pr-1"><Hashtag/> </div>
                        <div className="">
                            Tags
                        </div>    
                    </li>
                </ul>
            </div>

            <div className="my-5 mx-3 border-t">
                <div className="mt-7 mx-5 flex">
                    <div><Setting/></div>
                    <div className="ml-4 text-gray-500">Settings</div>
                </div>
                <div className="mt-4 mx-5 flex">
                    <div><Help/></div>
                    <div className="ml-4 text-gray-500">Help</div>
                </div>
            </div>
        </div> 
    )
}