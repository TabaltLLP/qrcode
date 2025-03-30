import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QRCode from 'react-qr-code';
import Logo from "../assets/Logo.webp"
import { Html5QrcodeScanner } from "html5-qrcode";

function QRData() {
    const [data, setData] = useState([]);
    const [inputData, setInputData] = useState({});
    const [identification, setIdentification] = useState("Enter details to get their QR code.");
    const [searchId, setSearchId] = useState("");
    const [filterData, setFilterData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const scannerRef = useRef(null);


    // Fetch all data from Google Sheet
    useEffect(() => {
        fetch('https://sheetdb.io/api/v1/9i1wvmi4sk2gz')
            .then((response) => response.json())
            .then((data) => setData(data));
    }, []);
    console.log(data);
    
    // Handle input change
    const handleInputChange = (e) => {
        setInputData({ ...inputData, [e.target.name]: e.target.value });
    };

    // Generating unique ID
    function generateId() {
        return uuidv4().replace(/-/g, '').slice(0, 6);
    }

    // Submit data to Google Sheet using sheet DB
    const createData = async (e) => {
        e.preventDefault();
        let randomGeneratedId = generateId();

        let updatedData = { ...inputData, asset_number: randomGeneratedId };
        setInputData(updatedData);

        fetch('https://sheetdb.io/api/v1/9i1wvmi4sk2gz', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: [updatedData]
            })
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                setIdentification(randomGeneratedId)
                toast.success("Data added successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }).catch((error) => {
                console.log(error);
                
                toast.error("Failed to add the data", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            })
    };

    // Handle search data
    const handleSearchData = async (e) => {
        e.preventDefault();
        let searchData = data.filter((value, index) => value.asset_number == searchId);
        if (searchData.length > 0) {
            setFilterData(searchData)
            toast.success("Data Fetch Successfully.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } else {
            setFilterData([]);
            toast.error("Data with this id not exist", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    }

    useEffect(() => {
        if (isModalOpen) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: 250 }
            );
    
            scanner.render(
                (decodedText) => {
                    setSearchId(decodedText); 
                    handleSearchData();
                    setIsModalOpen(false);
                    toast.success("QR Code Scanned Successfully!");
                    scanner.clear(); // Properly clear scanner when scan is done
                },
                (errorMessage) => {
                    console.log("QR Code Scan Error:", errorMessage);
                }
            );
    
            scannerRef.current = scanner;
        }
    
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => console.log("Error clearing scanner:", error));
            }
        };
    }, [isModalOpen]);
    
    
    return (

        <div className="bg-gray-900 text-white flex flex-col gap-10 items-center justify-center p-6">
            <img src={Logo} width="120px" alt="Logo" />
            <h1 className='text-5xl font-bold'>QR code scanner application</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl">
                <h2 className="text-2xl font-bold mb-4 text-center">Read data Using Asset Id</h2>
                <form onSubmit={handleSearchData} className="space-y-4">
                    <input
                        type="text"
                        required
                        name="search"
                        placeholder="Search by asset ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="w-full py-2 pl-3 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        type="submit"
                        className="w-50 mr-5 py-2 pl-3 mt-2 rounded cursor-pointer bg-purple-600 hover:bg-purple-700 text-white transition duration-300"
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="w-50 py-2 pl-3 mt-2 rounded cursor-pointer bg-purple-600 hover:bg-purple-700 text-white transition duration-300"
                    >
                        Scan QR
                    </button>
                </form>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl">
                <h2 className="text-2xl font-bold mb-4 text-center">View Data</h2>
                {filterData?.length > 0 && (
                    <div className="overflow-x-auto mt-6">
                        <table className="min-w-full bg-gray-800 text-white border border-gray-700 rounded-lg shadow-lg">
                            <thead className="bg-purple-600 text-white">
                                <tr>
                                    <th className="px-4 py-2 border border-gray-700">Asset Class</th>
                                    <th className="px-4 py-2 border border-gray-700">Brand</th>
                                    <th className="px-4 py-2 border border-gray-700">Owner</th>
                                    <th className="px-4 py-2 border border-gray-700">Start Date</th>
                                    <th className="px-4 py-2 border border-gray-700">Depreciation</th>
                                    <th className="px-4 py-2 border border-gray-700">Past Users</th>
                                    <th className="px-4 py-2 border border-gray-700">Office</th>
                                    <th className="px-4 py-2 border border-gray-700">Country</th>
                                    <th className="px-4 py-2 border border-gray-700">Project Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterData.map((value, index) => (
                                    <tr
                                        key={index}
                                        className="odd:bg-gray-700 even:bg-gray-600 hover:bg-gray-500 transition duration-200"
                                    >
                                        <td className="px-4 py-2 border border-gray-700">{value.asset_class}</td>
                                        <td className="px-4 py-2 border border-gray-700">{value.brand}</td>
                                        <td className="px-4 py-2 border border-gray-700">{value.asset_owner}</td>
                                        <td className="px-4 py-2 border border-gray-700">{value.asset_start_date}</td>
                                        <td className="px-4 py-2 border border-gray-700">{value.asset_depreciation}</td>
                                        <td className="px-4 py-2 border border-gray-700">{value.past_users}</td>
                                        <td className="px-4 py-2 border border-gray-700">{value.asset_office}</td>
                                        <td className="px-4 py-2 border border-gray-700">{value.country}</td>
                                        <td className="px-4 py-2 border border-gray-700">{value.project_code}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className='flex items-start justify-between'>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl">
                    <h2 className="text-2xl font-bold mb-4 text-center">Add New Asset Data</h2>
                    <form onSubmit={createData} className="space-y-4">
                        <div className="grid grid-cols-2 my-3 gap-4">
                            {
                                [
                                    { name: "asset_class", placeholder: "Asset Class" },
                                    { name: "brand", placeholder: "Brand" },
                                    { name: "asset_owner", placeholder: "Asset Owner" },
                                    { name: "asset_start_date", placeholder: "Asset Start Date (MM/DD/YYYY)" },
                                    { name: "asset_depreciation", placeholder: "Asset Depreciation" },
                                    { name: "past_users", placeholder: "Past Users" },
                                    { name: "asset_office", placeholder: "Asset Office" },
                                    { name: "country", placeholder: "Country" },
                                    { name: "project_code", placeholder: "Project Code" }
                                ].map((data, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        required
                                        name={data.name}
                                        placeholder={data.placeholder}
                                        onChange={handleInputChange}
                                        className="w-full py-2 pl-3 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                ))}
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 pl-3 mt-2 rounded cursor-pointer bg-purple-600 hover:bg-purple-700 text-white transition duration-300"
                        >
                            Add Data
                        </button>
                    </form>
                </div>
                <div className='ms-10 flex flex-col items-center justify-center'>
                    <h2 className='text-5xl font-bold my-7'>Generated QR Code</h2>
                    <QRCode bgColor='transparent' fgColor='white' value={identification} />
                </div>
            </div>
            {/* QR Scanner Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
                        <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
                        <div id="reader"></div>
                        <button onClick={() => setIsModalOpen(false)} className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
                            Close
                        </button>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}

export default QRData;
