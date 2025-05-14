import { useState } from "react";
import Modal from "./Modal";
import BrandingList from "./BrandingList";
import { BrandingProject } from "./brandingTypes";

export default function BrandingSection() {
  const [selected, setSelected] = useState<BrandingProject | null>(null);

  return (
    <section id="branding">
      <h1 className="text-center work_page_section_title_holder">Branding</h1>
      <BrandingList setSelected={setSelected}></BrandingList>

      <Modal selected={selected} setSelected={setSelected}></Modal>
    </section>
  );
}
