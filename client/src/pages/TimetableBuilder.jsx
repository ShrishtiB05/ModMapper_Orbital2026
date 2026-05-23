import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI']

const MODULE_COLOURS = ['#b85c38', '#1a2744', '#3d5a73', '#7a6a5a', '#c9a84c', '#2e3f6f']
const PX_PER_MIN = 1.6
const START_HOUR = 8

// converting time into mins from midnight 
const timeToMins = (t) => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(2, 4))

// convering above mins to px from the top of grid
const minsToTop = (mins) => (mins - START_HOUR * 60) * PX_PER_MIN

function TimetableBuilder() {
    const navigate = useNavigate()
    const [addedModules, setAddedModules] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedSlots, setSelectedSlots] = useState({})

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login') }
    }, [navigate])

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        const res = await fetch(`https://api.nusmods.com/v2/2024-2025/moduleList.json`)
        const data = await res.json()
        const filtered = data.filter(mod =>
            mod.moduleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mod.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResults(filtered.slice(0, 13))
    }

    const handleAddModule = async (moduleCode) => {
        if (addedModules.find(m => m.moduleCode === moduleCode)) {
            alert('Module already added!!')
            return
        }
        const res = await fetch(`https://api.nusmods.com/v2/2024-2025/modules/${moduleCode}.json`)
        const data = await res.json()
        const semData = data.semesterData?.find(s => s.semester === 1)
        if (semData) {
            const initialSlots = {}
            semData.timetable.forEach(lesson => {
                if (!initialSlots[lesson.lessonType]) {
                    initialSlots[lesson.lessonType] = lesson.classNo
                }
            })
            setSelectedSlots(prev => ({ ...prev, [moduleCode]: initialSlots }))
        }

        setAddedModules([...addedModules, data])
        setSearchResults([])
        setSearchQuery('')
    }

    const handleRemoveModule = (moduleCode) => {
        setAddedModules(prev => prev.filter(m => m.moduleCode !== moduleCode))
        setSelectedSlots(prev => {
            const next = { ...prev }
            delete next[moduleCode]
            return next
        })
    }

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

    // find the latest end time across all added modules, default being 1800
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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#fdf8f2' }}>

            {/* The Left Panel */}
            <div style={{ width: '260px', flexShrink: 0, padding: '24px 16px', borderRight: '1px solid #d4c4a8', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1a2744', margin: 0 }}>Timetable Builder</h2>

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

                {/* search results */}
                {searchResults.map(mod => (
                    <div key={mod.moduleCode} style={{ fontSize: '12px', padding: '6px 8px', background: '#f5edd8', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><strong>{mod.moduleCode}</strong> {mod.title}</span>
                        <button onClick={() => handleAddModule(mod.moduleCode)} style={{
                            background: '#1a2744', color: '#fdf8f2', border: 'none', borderRadius: '3px', padding: '2px 7px', fontSize: '11px', cursor: 'pointer', flexShrink: 0, marginLeft: '6px'
                        }}>Add</button>
                    </div>
                ))}

                { /* the added modules list */}
                {addedModules.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '600', color: '#7a6a5a', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: "'JetBrains Mono', 'monospace'" }}>Added modules</div>
                        {addedModules.map((mod, i) => (
                            <div key={mod.moduleCode} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{ width: '10px', height: '10px', fontFamily: "'JetBrains Mono', monospace", borderRadius: '2px', background: MODULE_COLOURS[i % MODULE_COLOURS.length], flexShrink: 0 }} />
                                <span style={{ fontSize: '12px', color: '#1a2744', flex: 1 }}>{mod.moduleCode}</span>
                                <button onClick={() => handleRemoveModule(mod.moduleCode)} style={{ background: 'none', border: 'none', color: '#7a6a5a', cursor: 'pointer', fontSize: '14px' }}>×</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT PANEL : TIMETABLE GRID */}
            <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>

                {/* Each day's headers */}
                <div style={{ display: 'flex', marginLeft: '52px', marginBottom: '4px' }}>
                    {DAY_LABELS.map(d => (
                        <div key={d} style={{ flex: 1, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: '600', color: '#1a2744', letterSpacing: '0.05em' }}>{d}</div>
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

                            {/* Hour lines */}
                            {hourSlots.map(hour => (
                                <div key={hour} style={{
                                    position: 'absolute',
                                    top: minsToTop(hour * 60),
                                    left: 0, right: 0,
                                    borderTop: '1px solid #d4c4a8'
                                }} />
                            ))}

                            {/* Lesson blocks */}
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
                                            right: 'auto',
                                            background: color,
                                            borderRadius: '4px',
                                            padding: '4px 6px',
                                            color: 'white',
                                            fontSize: '11px',
                                            overflow: 'hidden',
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
