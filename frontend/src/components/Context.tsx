interface ContextProps {
    currentContext: Array<{ title: string; path: string }>,
    setCurrentContext: (value: Array<{ title: string; path: string }>) => void
}

const Context = ({currentContext, setCurrentContext}: ContextProps) => {
    const removeContext = (indexToRemove: number) => {
        setCurrentContext(currentContext.filter((_, i) => i !== indexToRemove))
    }
    return (
        <>
        {(currentContext.length > 0) &&
        <div className="bpComposerFileContainer" >
            {currentContext.map((context, index) => (
                <div
                    className="bpComposerFileAttachement"
                    key={index}
                    style={{
                        backgroundColor: "rgb(0 144 255/.1)",
                        border: "none"
                    }}
                    >
                    <div
                        style={{
                            minWidth: "96px",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            lineHeight: "calc(var(--bpFontSize-scale) * var(--bpFontSize-lg))",
                            fontSize: "calc(var(--bpFontSize-scale) * var(--bpFontSize-sm))",
                            color: "var(--bpGray-900)"
                        }}
                    >
                    <div className="bpComposerFileName" style={{maxWidth: 'none', color: "rgb(0 144 255/1)", fontWeight: "600",}}>{context.title}</div>
                    <div className="bpComposerFileExtension" style={{fontWeight: "400"}}>{context.path}</div>
                    </div>
                    <svg onClick={() => removeContext(index)} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-circle-x bpComposerFileRemoveIcon" role="button" tabIndex={0} aria-label="Remove File Button"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
                </div>
            ))}
        </div>}
        </>
    )
}

export default Context