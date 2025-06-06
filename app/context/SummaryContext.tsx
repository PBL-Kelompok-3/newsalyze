"use client"

import { createContext, useContext, useState } from "react"

type SummaryContextType = {
    summary: string
    setSummary: (val: string) => void
    inputText: string
    setInputText: (val: string) => void
    showSummary: boolean
    setShowSummary: (val: boolean) => void
    recommendations: any[]
    setRecommendations: (val: any[]) => void
}

export const SummaryContext = createContext<SummaryContextType>({
    summary: "",
    setSummary: () => {},
    inputText: "",
    setInputText: () => {},
    showSummary: false,
    setShowSummary: () => {},
    recommendations: [],
    setRecommendations: () => {},
})


export const SummaryProvider = ({ children }: { children: React.ReactNode }) => {
    const [summary, setSummary] = useState("")
    const [inputText, setInputText] = useState("")
    const [showSummary, setShowSummary] = useState(false)
    const [recommendations, setRecommendations] = useState<any[]>([])


    return (
        <SummaryContext.Provider value={{ summary, setSummary, inputText, setInputText, showSummary, setShowSummary, recommendations, setRecommendations }}>
            {children}
        </SummaryContext.Provider>
    )
}

export const useSummary = () => {
    const ctx = useContext(SummaryContext)
    if (!ctx) throw new Error("useSummary must be used within a SummaryProvider")
    return ctx
}
