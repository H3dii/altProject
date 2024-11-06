import { useEffect, useState } from "react";
import Icon from "./Icons";
import { SelectType } from "~/utils/types";

type SelectProps = {
    selectedData?: SelectType[] | null;
    defaultData?: SelectType | null;
    placeholder: string;
    onChange?: (selected: SelectType | null) => void;
};

function SelectOne({ selectedData, defaultData, placeholder, onChange }: SelectProps) {
    const [isSelectOpen, setSelectOpen] = useState<boolean>(false);
    const [isSelected, setSelected] = useState<SelectType | null>(null);

    const handleSelection = (data: SelectType) => {
        setSelected(data);
        if (onChange) {
            onChange(data);
        }
    };
    useEffect(() => {
        console.log(defaultData);
        if (defaultData) {
            setSelected(defaultData);
        }
    }, [defaultData]);

    return (
        <div className="w-full relative h-[2.5rem] ">
            <div onClick={() => setSelectOpen(!isSelectOpen)} className={`${isSelectOpen ? "border-sky-500 " : "hover:border-sky-500 border-transparent"} duration-200 cursor-pointer border  w-full bg-neutral-800 rounded-md h-full flex justify-between items-center px-4`}>
                <span className="text-lg font-medium">{isSelected ? isSelected?.label : placeholder} </span>
                <Icon name="FaCaretDown" className={`${isSelectOpen ? "rotate-180" : "rotate-0"} duration-200 text-lg`} />
            </div>
            <div className={`${isSelectOpen ? "top-[3rem] opacity-100 pointer-events-auto" : "top-[2.5rem] opacity-0 pointer-events-none"} max-h-[14.5rem] overflow-auto absolute duration-200 left-0 bg-neutral-800 p-1.5 gap-1 flex flex-col w-full rounded-md z-40`}>
                {selectedData &&
                    selectedData.map((data: SelectType, i: number) => (
                        <button key={i} onClick={() => handleSelection(data)} className={`${isSelected?.value === data.value ? "bg-neutral-700/30 text-sky-500" : "hover:bg-neutral-700/60"} w-full px-4 py-1.5 duration-200 flex items-center justify-start text-lg font-medium  rounded-md`}>
                            {data.label}
                        </button>
                    ))}
            </div>
        </div>
    );
}

export default SelectOne;
