import { useState, useEffect } from 'react'

function ModuleSearch() {
    const [modules, setModules] = useState([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('https://api.nusmods.com/v2/2024-2025/moduleList.json')
            .then(res => res.json())
            .then(data => {
                setModules(data)
                setLoading(false)
            })
    }, [])

    const filtered = modules.filter(mod =>
        mod.moduleCode.toLowerCase().includes(query.toLowerCase()) ||
        mod.title.toLowerCase().includes(query.toLowerCase())
    )

    if (loading) return <div>Loading mods...</div>

    return (
        <div>
            <h1>Module Search</h1>
            <input
                type="text"
                placeholder="Search by code or name..."
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            <p>{filtered.length} modules found</p>
            {filtered.slice(0, 20).map(mod => (
                <div key={mod.moduleCode}>
                    <strong>{mod.moduleCode}</strong> — {mod.title}
                </div>
            ))}
        </div>
    )
}

export default ModuleSearch