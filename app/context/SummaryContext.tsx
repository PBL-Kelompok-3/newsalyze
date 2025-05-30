"use client"

import { createContext, useContext, useState } from "react"

type SummaryContextType = {
    summary: string
    setSummary: (val: string) => void
    inputText: string
    setInputText: (val: string) => void
    showSummary: boolean
    setShowSummary: (val: boolean) => void
}

export const SummaryContext = createContext<SummaryContextType>({
    summary: "",
    setSummary: () => {},
    inputText: "",
    setInputText: () => {},
    showSummary: false,
    setShowSummary: () => {},
})

export const SummaryProvider = ({ children }: { children: React.ReactNode }) => {
    const [summary, setSummary] = useState("")
    const [inputText, setInputText] = useState("")
    const [showSummary, setShowSummary] = useState(false)

    return (
        <SummaryContext.Provider value={{ summary, setSummary, inputText, setInputText, showSummary, setShowSummary }}>
            {children}
        </SummaryContext.Provider>
    )
}

// ⬇⬇⬇ INI YANG BELUM ADA
export const useSummary = () => {
    const ctx = useContext(SummaryContext)
    if (!ctx) throw new Error("useSummary must be used within a SummaryProvider")
    return ctx
}
