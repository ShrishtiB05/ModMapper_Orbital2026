import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function TimetableBuilder() {
    const navigate = useNavigate()
    const [addedModules, setAddedModules] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        const res = await fetch(
            `https://api.nusmods.com/v2/2024-2025/moduleList.json`
        )
        const data = await res.json()
        const filtered = data.filter(mod =>
            mod.moduleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mod.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResults(filtered.slice(0, 13))
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login') }
    }, [navigate])

    return (
        <div>
            <h1>Timetable Builder</h1>
            <input
                type="text"
                placeholder="Search modules e.g. CS3230"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            <div>
                {searchResults.map(mod => (
                    <div key={mod.moduleCode}>
                        <strong>{mod.moduleCode}</strong> — {mod.title}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TimetableBuilder
