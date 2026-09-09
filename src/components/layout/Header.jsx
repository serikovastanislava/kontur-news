import { Search, Moon, ChevronDown, Menu } from 'lucide-react';
import Logo from '../common/Logo';
const navLinks=['Главная','Мир','Политика','Экономика','Технологии','Общество','Спорт','Культура','Наука'];
export default function Header(){return <header className="header"><Logo compact/><nav className="top-nav">{navLinks.map((x,i)=><a className={i===0?'active':''} key={x}>{x}</a>)}</nav><div className="header-actions"><button><Search size={16}/></button><button><Moon size={15}/></button><button className="lang">RU<ChevronDown size={11}/></button></div><button className="mobile-menu"><Menu size={19}/></button></header>}
