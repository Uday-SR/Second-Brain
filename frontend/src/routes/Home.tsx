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
  const [sidebar, setSidebar] = useState(false);
  const toggleSidebar = () => setSidebar(!sidebar);

  const [showContentModal, setShowContentModal] = useState(false);
  const [content, setContent] = useState<ContentItem[]>([]);

  const fetchAllContent = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get<ContentItem[]>(
        'https://second-brain-backend-p1hj.onrender.com/api/v1/content/contents',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setContent(res.data || []);
    } catch (error) {
      console.log("Error fetching content", error);
    }
  };

  useEffect(() => {
    fetchAllContent();
  }, [showContentModal]);

  const deleteContent = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(
        `https://second-brain-backend-p1hj.onrender.com/api/v1/content/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setContent(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.log("Error deleting content", error);
    }
  };

  return (
    <div className="flex">

      <Sidebar expanded={sidebar} toggleSidebar={toggleSidebar} />

      <div
        className={`
          flex-1 min-h-screen bg-blue-200 transition-all duration-300 ease-in-out
          ${sidebar ? "ml-40 sm:ml-60" : "ml-16 sm:ml-20"}
          p-3 sm:p-5
        `}
      >

        <div className="flex justify-between items-center gap-2 mb-4">

          <div className="flex gap-2 ml-auto">

            <div className="scale-90 sm:scale-100">
              <Button
                variant="primary"
                size="sm"
                text="Add"
                startIcon={<PlusIcon />}
                onClick={() => setShowContentModal(true)}
              />
            </div>

            <div className="scale-90 sm:scale-100">
              <Button
                variant="secondary"
                size="sm"
                text="Share"
                startIcon={<ShareIcon />}
                onClick={() => {}}
              />
            </div>

          </div>
        </div>

        <div
          className={`
            grid gap-3 sm:gap-4
            ${sidebar 
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" 
              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
            }
          `}
        >

          {content.length > 0 ? (
            content.map((item) => (
              <Card
                key={item.id}
                id={item.id}
                title={item.title}
                link={item.link}
                description={item.description}
                tags={item.tags}
                type={item.type === 'youtube' ? 'youtube' : 'twitter'}
                onDelete={deleteContent}
                onRefresh={fetchAllContent}
              />
            ))
          ) : (
            <div className="text-black col-span-full text-center">
              No content available. Click "Add Content" to get started!
            </div>
          )}

        </div>
      </div>

      {showContentModal && (
        <ContentModal onClose={() => setShowContentModal(false)} />
      )}
    </div>
  );
}

export default App;