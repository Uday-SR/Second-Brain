import { Logo } from "../icons/Logo"
import { TweetIcon } from "../icons/TweetIcon"
import { YoutubeIcon } from "../icons/YoutubeIcon"
import { DocIcon } from "../icons/DocIcon"
import { LinkIcon } from "../icons/LinkIcon"

export function Sidebar() {
    return (
        <div className="h-screen bg-white w-76 border-r left-0 top-0 fixed">
            <div className="flex">
                <div>
                    <Logo/>
                </div>
                <div className="font-medium mt-10 text-4xl">
                    SiteName
                </div>
            </div>

            <div className="mx-5 my-20 px-3 text-3xl">
                <ul className="text-stone-500">
                    <li className="py-2 flex pb-5">
                        <div><TweetIcon/></div>
                        <div className="">
                            Tweets
                        </div>    
                    </li>

                    <li className="py-2 flex pb-5">
                        <YoutubeIcon/>
                        <div>
                            Videos
                        </div>    
                    </li>

                    <li className="py-2 flex pb-5">
                        <div className="text-black pt-2 pr-4"><DocIcon/></div>
                        <div>
                            Documents
                        </div>    
                    </li>

                    <li className="py-2 flex pb-5 ">
                        <div className="pr-1"><LinkIcon/></div>
                        <div>
                            Links
                        </div>    
                    </li>

                    <li className="py-2 flex pb-5">
                        <TweetIcon/> 
                        <div>
                            Tags
                        </div>    
                    </li>
                </ul>
            </div>
        </div>
    )
}