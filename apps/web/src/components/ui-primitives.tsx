import Link from "next/link";
import type {ReactNode} from "react";

export type ActionLinkProps={
  href:string;children:ReactNode;variant?:"primary"|"secondary"|"text";
  className?:string;label?:string;
};
export function ActionLink({href,children,variant="primary",className="",label}:ActionLinkProps){
  const style=variant==="primary"?"ui-button ui-button-primary":
    variant==="secondary"?"ui-button ui-button-secondary":"ui-button ui-button-text";
  return <Link href={href} className={[style,className].filter(Boolean).join(" ")}
    aria-label={label}>{children}</Link>;
}
export function SurfaceCard({children,className="",eyebrow}:{
  children:ReactNode;className?:string;eyebrow?:string;
}){
  return <article className={["ui-card",className].filter(Boolean).join(" ")}>
    {eyebrow&&<p className="ui-eyebrow">{eyebrow}</p>}
    {children}
  </article>;
}
export function SectionHeading({eyebrow,title,description,id}:{
  eyebrow:string;title:string;description?:string;id:string;
}){
  return <header className="ui-section-heading">
    <p className="ui-eyebrow">{eyebrow}</p>
    <h2 id={id}>{title}</h2>
    {description&&<p>{description}</p>}
  </header>;
}
export function StatusPill({children,tone="neutral"}:{
  children:ReactNode;tone?:"neutral"|"olive"|"terracotta";
}){
  return <span className={"ui-pill ui-pill-"+tone}>{children}</span>;
}
