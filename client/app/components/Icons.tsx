import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as VscIcons from "react-icons/vsc";
import * as RxIcons from "react-icons/rx";
import * as GoIcons from "react-icons/go";
const Icons = { ...FaIcons, ...MdIcons, ...VscIcons, ...RxIcons, ...GoIcons };

interface IconProps {
    name: keyof typeof Icons;
    className?: string;
}

export default function Icon({ name, className }: IconProps) {
    const IconComponent = Icons[name];

    if (!IconComponent) return <p>Icon not found!</p>;

    return <IconComponent className={className} />;
}
