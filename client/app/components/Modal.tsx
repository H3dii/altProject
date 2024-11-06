import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { forwardRef } from "react";
import { useImperativeHandle } from "react";
import Icon from "./Icons";
export const ModalComponent = forwardRef((props: any, ref: any) => {
    const [open, setOpen] = useState(false);
    const [width, setWidth] = useState("25rem");
    const [height, setHeight] = useState("max-content");
    useImperativeHandle(ref, () => {
        return {
            open: () => setOpen(true),
            close: () => {
                setOpen(false);
            },
            width: (w: string) => {
                setWidth(w);
            },
            height: (h: string) => {
                setHeight(h);
            },
        };
    });
    return (
        <>
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur z-50"></motion.div>
                        <div className="p-5 fixed z-50 top-0 left-0 w-full h-full flex justify-center items-center">
                            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} style={{ width: width, height: height }} className="bg-neutral-900 shadow drop-shadow min-w-[25rem]  max-h-[calc(100%_-_2rem)] min-h-[4.5rem] overflow-auto z-50 rounded-md break-all p-6">
                                <button onClick={() => setOpen(false)} className="z-50 absolute right-2 top-3 hover:text-rose-500 duration-200 group p-2">
                                    <Icon name="VscClose" className="w-8 h-8 duration-300 group-hover:rotate-90" />
                                </button>
                                <div>{props.children}</div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
});
