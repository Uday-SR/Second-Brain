import '../App.css'
import { Button } from '../components/Buttons'
import { Card } from '../components/Card'
import { ShareIcon } from '../icons/ShareIcon'
import { PlusIcon } from '../icons/PlusIcon'
import { Sidebar } from '../components/Sidebar'
import { useEffect, useState } from 'react'
import ContentModal from '../components/ContentModal'
import axios from 'axios'

interface ContentItem {
  id: number;
  title: string;
  link: string;
  tags: string;
  userId: number;
  description: string;
  type: 'youtube' | 'other';
}

function App() {
  const [ sidebar, setSidebar ] = useState(true);
  const toggleSidebar = () => setSidebar(!sidebar);

  const [ showContentModal, setShowContentModal ] = useState(false);

  const [ content, setContent ] = useState<ContentItem[]>([]);

  const fetchAllContent = async () => {

    const token = await localStorage.getItem("token");

    if(!token) return;

    try {

      const res = await axios.get<ContentItem[]>('https://second-brain-backend-alpha.vercel.app/api/v1/content/contents', {
        headers: {
          Authorization : `Bearer ${token}`
        }
      });

      setContent(res.data || []);

      console.log("Fetched content: ", res.data);

    } catch (error) {

      console.log("Error fetching content", error);
    }  
  }

  useEffect(() => {
    fetchAllContent();
  }, [showContentModal]); 

  const deleteContent = async (id: number) => {
    const token = await localStorage.getItem("token");  
    if(!token) return;

    try {
      await axios.delete(`https://second-brain-backend-alpha.vercel.app/api/v1/content/${id}`, {
        headers: {
          Authorization : `Bearer ${token}`
        }
      });
      setContent(prevContent => prevContent.filter(item => item.id !== id));
    } catch (error) {
      console.log("Error deleting content", error);
    }
  }

  
  return ( 
    <div className=''>
      <Sidebar expanded={sidebar} toggleSidebar={toggleSidebar}/>
      <div className={`flex-1 min-h-screen bg-blue-200 text-white transition-all duration-300 
          ${sidebar ? "ml-60" : "ml-20"} p-5`}>
        
        <div>
          <div className='flex px-2 py-4 space-x-4 justify-end'>
            <Button variant="primary" size="sm" text="Add Content" startIcon={<PlusIcon/>} onClick={() => setShowContentModal(true)}></Button>
            <Button variant="secondary" size="sm" text="Share" startIcon={<ShareIcon/>} onClick={() => {}}></Button>
          </div> 
          <br/>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 relative'>
            
            {content.length > 0 ? content.map((item) => (
              <Card 
                id={item.id}
                title={item.title}
                link={item.link}
                description={item.description}
                tags={item.tags}
                type={item.type === 'youtube' ? 'youtube' : 'twitter'}
                onDelete={deleteContent}
                onRefresh={fetchAllContent}
              />

            )) : <div className='text-black'>No content available. Click "Add Content" to get started!</div>}
            
          </div>
        </div>  
      </div>
        {showContentModal && <ContentModal onClose={() => setShowContentModal(false)}/>}
      </div>
  )
}

export default App
