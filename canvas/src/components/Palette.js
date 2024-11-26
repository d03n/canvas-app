import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Pallete = () => {

  return (
    <div className="flex flex-row gap-2 items-center justify-center bg-gray-300 w-80 rounded-md p-2">
      <div className="flex bg-white w-10 p-1 rounded-md items-center cursor-pointer">
        <FontAwesomeIcon icon="fa-solid fa-paperclip" size="2x"/>
      </div>
      <div className="flex bg-white w-10 p-1 rounded-md items-center cursor-pointer">
        <FontAwesomeIcon icon="fa-solid fa-paperclip" size="2x"/>
      </div>
      <div className="flex bg-white w-10 p-1 rounded-md items-center cursor-pointer">
        <FontAwesomeIcon icon="fa-solid fa-paperclip" size="2x"/>
      </div>
      <div className="flex bg-white w-10 p-1 rounded-md items-center cursor-pointer">
        <FontAwesomeIcon icon="fa-solid fa-paperclip" size="2x"/>
      </div>
      
    </div>
  )
};

export default Pallete;