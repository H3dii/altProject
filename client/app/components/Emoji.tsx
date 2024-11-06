import Twemoji from "twemoji";
import { Icon } from "@iconify-icon/react";
export default function Emoji({ text, size, rounded = false }: { text: string; size: string; rounded?: boolean }) {
    if (text.startsWith(":") && text.endsWith(":")) {
        const iconName = text.substring(1, text.length - 1);
        if (rounded) {
            const sizeValue = parseInt(size);
            const width = `${sizeValue * 0.7}px`;
            const height = `${sizeValue * 0.7}px`;
            return (
                <div style={{ width, height }} className="rounded-full overflow-hidden flex items-center justify-center">
                    <Icon icon={`twemoji:${iconName}`} className={"emoji"} style={{ fontSize: size }} />
                </div>
            );
        } else {
            return <Icon icon={`twemoji:${iconName}`} className={"emoji"} style={{ fontSize: size }} />;
        }
    } else {
        const code = Twemoji.parse(text);
        const match = code.match(/(\d+)x(\d+)\/(\d+)\.png"/);
        if (match) {
            const id = match[3];
            const newUrl = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${id}.svg`;
            const newAlt = text;
            return <img className="emoji" draggable="false" src={newUrl} alt={newAlt} style={{ width: size, height: size }} />;
        } else {
            return <div>Invalid emoji code</div>;
        }
    }
}
