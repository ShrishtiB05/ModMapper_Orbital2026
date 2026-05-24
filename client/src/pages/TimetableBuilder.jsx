import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI']
const MODULE_COLOURS = ['#b85c38', '#1a2744', '#3d5a73', '#7a6a5a', '#c9a84c', '#2e3f6f']
const PX_PER_MIN = 1.6
const START_HOUR = 8
const BACKEND = 'https://modmapperorbital2026-production.up.railway.app'

// Time helpers 
const timeToMins = (t) => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(2, 4))
const minsToTop = (mins) => (mins - START_HOUR * 60) * PX_PER_MIN

// Normalise Siddharth's backend response to the semesterData shape 
// Sid returns: { module_code, module_name, semesters: [{ semester, timetable, examDate }] }
// This component reads: mod.semesterData?.find(s => s.semester === 1)


// Clash detection
function detectClashes(addedModules, selectedSlots) {
    const clashes = []
    DAYS.forEach(day => {
        const lessons = []
        addedModules.forEach(mod => {
            const semData = mod.semesterData?.find(s => s.semester === 1)
            if (!semData) return
            const modSlots = selectedSlots[mod.moduleCode] || {}
            semData.timetable.forEach(l => {
                if (l.day === day && l.classNo === modSlots[l.lessonType]) {
                    lessons.push({ ...l, moduleCode: mod.moduleCode })
                }
            })
        })
        for (let i = 0; i < lessons.length; i++) {
            for (let j = i + 1; j < lessons.length; j++) {
                const a = lessons[i], b = lessons[j]
                if (timeToMins(a.startTime) < timeToMins(b.endTime) &&
                    timeToMins(b.startTime) < timeToMins(a.endTime)) {
                    clashes.push(`${a.moduleCode} & ${b.moduleCode} on ${day} (${a.startTime}–${a.endTime})`)
                }
            }
        }
    })
    return [...new Set(clashes)]
}


function TimetableBuilder() {
    const navigate = useNavigate()
    const [addedModules, setAddedModules] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedSlots, setSelectedSlots] = useState({})
    const [saveStatus, setSaveStatus] = useState('') // '', 'saving', 'saved', 'error'
    const [loadError, setLoadError] = useState('')

    // Auth guard 
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) navigate('/login')
    }, [navigate])

    // Load saved timetable on mount 
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return
        fetch(`${BACKEND}/timetable`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => {
                // 500 = no timetable row exists yet for this user — treat as empty, not an error
                if (r.status === 500 || r.status === 404) return null
                if (!r.ok) throw new Error(`Unexpected status ${r.status}`)
                return r.json()
            })
            .then(data => {
                if (!data || !data.length) return
                const saved = data[0].timetable_data
                if (saved?.addedModules) setAddedModules(saved.addedModules)
                if (saved?.selectedSlots) setSelectedSlots(saved.selectedSlots)
            })
            .catch(() => setLoadError('Could not load saved timetable.'))
    }, [])

    // Save timetable 
    const handleSave = async () => {
        const token = localStorage.getItem('token')
        if (!token) return
        setSaveStatus('saving')
        try {
            const res = await fetch(`${BACKEND}/timetable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    timetable_data: { addedModules, selectedSlots },
                }),
            })
            setSaveStatus(res.ok ? 'saved' : 'error')
        } catch {
            setSaveStatus('error')
        }
        setTimeout(() => setSaveStatus(''), 2500)
    }

    // Module search (NUSMods list — Sid has no search endpoint currently ) 
    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        const res = await fetch('https://api.nusmods.com/v2/2024-2025/moduleList.json')
        const data = await res.json()
        const filtered = data.filter(mod =>
            mod.moduleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mod.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResults(filtered.slice(0, 13))
    }

    const handleAddModule = async (moduleCode) => {
        if (addedModules.find(m => m.moduleCode === moduleCode)) {
            alert('Module already added!')
            return
        }
        try {
            const res = await fetch(
                `https://api.nusmods.com/v2/2024-2025/modules/${encodeURIComponent(moduleCode)}.json`
            )
            if (!res.ok) { alert(`Module ${moduleCode} not found.`); return }
            const mod = await res.json()

            const semData = mod.semesterData?.find(s => s.semester === 1)
            if (semData) {
                const initialSlots = {}
                semData.timetable.forEach(lesson => {
                    if (!initialSlots[lesson.lessonType]) {
                        initialSlots[lesson.lessonType] = lesson.classNo
                    }
                })
                setSelectedSlots(prev => ({ ...prev, [moduleCode]: initialSlots }))
            }

            setAddedModules(prev => [...prev, mod])
            setSearchResults([])
            setSearchQuery('')
        } catch (err) {
            console.error('Failed to add module:', err)
            alert('Could not load module. Check your connection.')
        }
    }

    // Remove module 
    const handleRemoveModule = (moduleCode) => {
        setAddedModules(prev => prev.filter(m => m.moduleCode !== moduleCode))
        setSelectedSlots(prev => {
            const next = { ...prev }
            delete next[moduleCode]
            return next
        })
    }

    // Timetable grid helpers 
    const getLessonsForDay = (day) => {
        const lessons = []
        addedModules.forEach(mod => {
            const semData = mod.semesterData?.find(s => s.semester === 1)
            if (!semData) return
            const modSlots = selectedSlots[mod.moduleCode] || {}
            semData.timetable.forEach(lesson => {
                if (lesson.classNo === modSlots[lesson.lessonType] && lesson.day === day) {
                    lessons.push({ ...lesson, moduleCode: mod.moduleCode })
                }
            })
        })
        return lessons
    }

    const getLessonsWithLanes = (day) => {
        const lessons = getLessonsForDay(day)
        if (lessons.length === 0) return []
        const sorted = [...lessons].sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime))
        const lanes = []
        const assigned = sorted.map(lesson => {
            let laneIndex = 0
            while (true) {
                if (!lanes[laneIndex]) lanes[laneIndex] = []
                const conflict = lanes[laneIndex].some(other =>
                    timeToMins(other.startTime) < timeToMins(lesson.endTime) &&
                    timeToMins(other.endTime) > timeToMins(lesson.startTime)
                )
                if (!conflict) break
                laneIndex++
            }
            lanes[laneIndex].push(lesson)
            return { ...lesson, laneIndex }
        })
        return assigned.map(lesson => {
            const concurrent = assigned.filter(other =>
                timeToMins(other.startTime) < timeToMins(lesson.endTime) &&
                timeToMins(other.endTime) > timeToMins(lesson.startTime)
            )
            return { ...lesson, totalLanes: Math.max(...concurrent.map(l => l.laneIndex)) + 1 }
        })
    }

    const getEndHour = () => {
        let maxMins = 18 * 60
        addedModules.forEach(mod => {
            const semData = mod.semesterData?.find(s => s.semester === 1)
            if (!semData) return
            const modSlots = selectedSlots[mod.moduleCode] || {}
            semData.timetable.forEach(lesson => {
                if (lesson.classNo === modSlots[lesson.lessonType]) {
                    const endMins = timeToMins(lesson.endTime)
                    if (endMins > maxMins) maxMins = endMins
                }
            })
        })
        return Math.ceil(maxMins / 60)
    }

    const endHour = getEndHour()
    const totalHeight = (endHour - START_HOUR) * 60 * PX_PER_MIN
    const hourSlots = Array.from({ length: endHour - START_HOUR + 1 }, (_, i) => START_HOUR + i)
    const clashes = detectClashes(addedModules, selectedSlots)

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#fdf8f2' }}>

            {/* LEFT PANEL (Search button and added modules) */}
            <div style={{
                width: '280px', flexShrink: 0, padding: '24px 16px',
                borderRight: '1px solid #d4c4a8', display: 'flex',
                flexDirection: 'column', gap: '12px', overflowY: 'auto'
            }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1a2744', margin: 0 }}>
                    Timetable Builder
                </h2>

                {loadError && (
                    <div style={{ fontSize: '11px', color: '#b71c1c', background: '#fdecea', borderRadius: '4px', padding: '6px 8px' }}>
                        {loadError}
                    </div>
                )}

                {/* Search input */}
                <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    style={{ padding: '8px 10px', border: '1px solid #d4c4a8', borderRadius: '4px', fontSize: '13px', background: '#fff' }}
                />
                <button
                    onClick={handleSearch}
                    style={{ padding: '8px', background: '#b85c38', color: '#fdf8f2', border: 'none', borderRadius: '4px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', cursor: 'pointer' }}
                >
                    SEARCH
                </button>

                {/* Search results */}
                {searchResults.map(mod => (
                    <div key={mod.moduleCode} style={{ fontSize: '12px', padding: '6px 8px', background: '#f5edd8', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><strong>{mod.moduleCode}</strong> {mod.title}</span>
                        <button
                            onClick={() => handleAddModule(mod.moduleCode)}
                            style={{ background: '#1a2744', color: '#fdf8f2', border: 'none', borderRadius: '3px', padding: '2px 7px', fontSize: '11px', cursor: 'pointer', flexShrink: 0, marginLeft: '6px' }}
                        >
                            Add
                        </button>
                    </div>
                ))}

                {/* Added modules list with slot selectors */}
                {addedModules.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '600', color: '#7a6a5a', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'JetBrains Mono', monospace" }}>
                            Added modules
                        </div>

                        {addedModules.map((mod, i) => {
                            const colour = MODULE_COLOURS[i % MODULE_COLOURS.length]
                            const semData = mod.semesterData?.find(s => s.semester === 1)
                            const lessonTypes = semData
                                ? [...new Set(semData.timetable.map(l => l.lessonType))]
                                : []

                            return (
                                <div key={mod.moduleCode} style={{
                                    marginBottom: '10px', borderRadius: '6px',
                                    border: '1px solid #d4c4a8', padding: '8px 10px',
                                    background: '#fdf8f2'
                                }}>
                                    {/* Module header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: lessonTypes.length ? '8px' : 0 }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: colour, flexShrink: 0 }} />
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#1a2744', flex: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                                            {mod.moduleCode}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveModule(mod.moduleCode)}
                                            style={{ background: 'none', border: 'none', color: '#7a6a5a', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {/* Slot selector with one dropdown per lessonType */}
                                    {lessonTypes.map(lessonType => {
                                        const options = [...new Set(
                                            semData.timetable
                                                .filter(l => l.lessonType === lessonType)
                                                .map(l => l.classNo)
                                        )].sort()
                                        const current = selectedSlots[mod.moduleCode]?.[lessonType] ?? options[0] ?? ''

                                        return (
                                            <div key={lessonType} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                <span style={{
                                                    fontSize: '10px', color: '#7a6a5a',
                                                    minWidth: '68px', textTransform: 'capitalize',
                                                    fontFamily: "'JetBrains Mono', monospace"
                                                }}>
                                                    {lessonType.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <select
                                                    value={current}
                                                    onChange={e =>
                                                        setSelectedSlots(prev => ({
                                                            ...prev,
                                                            [mod.moduleCode]: {
                                                                ...(prev[mod.moduleCode] ?? {}),
                                                                [lessonType]: e.target.value,
                                                            },
                                                        }))
                                                    }
                                                    style={{
                                                        flex: 1, border: '1px solid #d4c4a8',
                                                        borderRadius: '4px', padding: '2px 4px',
                                                        fontSize: '11px', fontFamily: "'JetBrains Mono', monospace",
                                                        background: '#fff', cursor: 'pointer', color: '#1a2744'
                                                    }}
                                                >
                                                    {options.map(o => (
                                                        <option key={o} value={o}>{o}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* RIGHT PANEL : TIMETABLE GRID  */}
            <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>

                {/* Grid title + save button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1a2744' }}>
                        Weekly Timetable
                    </h2>
                    <button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        style={{
                            background: saveStatus === 'saved' ? '#2e7d32' : saveStatus === 'error' ? '#c62828' : '#b85c38',
                            color: '#fff', border: 'none', borderRadius: '5px',
                            padding: '6px 14px', fontSize: '12px', fontWeight: '600',
                            cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                            fontFamily: "'JetBrains Mono', monospace",
                            transition: 'background 0.2s',
                        }}
                    >
                        {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? 'Error — retry?' : 'Save'}
                    </button>
                </div>

                {/* Clash warning banner/alert */}
                {clashes.length > 0 && (
                    <div style={{
                        background: '#fdecea', border: '1px solid #f5a19a', borderRadius: '6px',
                        padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#b71c1c'
                    }}>
                        <strong>⚠ {clashes.length} clash{clashes.length > 1 ? 'es' : ''} detected</strong>
                        <ul style={{ margin: '4px 0 0', paddingLeft: '16px' }}>
                            {clashes.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </div>
                )}

                {/* Day column headers */}
                <div style={{ display: 'flex', marginLeft: '52px', marginBottom: '4px' }}>
                    {DAY_LABELS.map(d => (
                        <div key={d} style={{ flex: 1, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: '600', color: '#1a2744', letterSpacing: '0.05em' }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Grid body */}
                <div style={{ display: 'flex' }}>

                    {/* Time labels */}
                    <div style={{ width: '52px', position: 'relative', height: totalHeight, flexShrink: 0 }}>
                        {hourSlots.map(hour => (
                            <div key={hour} style={{
                                position: 'absolute',
                                top: minsToTop(hour * 60) - 7,
                                right: '8px',
                                fontSize: '10px',
                                fontFamily: "'JetBrains Mono', monospace",
                                color: '#7a6a5a',
                            }}>
                                {hour.toString().padStart(2, '0')}00
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {DAYS.map(day => (
                        <div key={day} style={{ flex: 1, position: 'relative', height: totalHeight, borderLeft: '1px solid #d4c4a8' }}>
                            {hourSlots.map(hour => (
                                <div key={hour} style={{
                                    position: 'absolute', top: minsToTop(hour * 60),
                                    left: 0, right: 0, borderTop: '1px solid #d4c4a8'
                                }} />
                            ))}
                            {getLessonsWithLanes(day).map(lesson => {
                                const modIndex = addedModules.findIndex(m => m.moduleCode === lesson.moduleCode)
                                const color = MODULE_COLOURS[modIndex % MODULE_COLOURS.length]
                                const top = minsToTop(timeToMins(lesson.startTime))
                                const height = (timeToMins(lesson.endTime) - timeToMins(lesson.startTime)) * PX_PER_MIN
                                return (
                                    <div
                                        key={`${lesson.moduleCode}-${lesson.lessonType}-${lesson.classNo}`}
                                        style={{
                                            position: 'absolute',
                                            top: top + 1,
                                            height: height - 2,
                                            left: `calc(${lesson.laneIndex * (100 / lesson.totalLanes)}% + 2px)`,
                                            width: `calc(${100 / lesson.totalLanes}% - 4px)`,
                                            background: color, borderRadius: '4px',
                                            padding: '4px 6px', color: 'white',
                                            fontSize: '11px', overflow: 'hidden',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600' }}>{lesson.moduleCode}</div>
                                        <div style={{ opacity: 0.85 }}>{lesson.lessonType}</div>
                                        <div style={{ opacity: 0.7 }}>{lesson.venue}</div>
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TimetableBuilder
