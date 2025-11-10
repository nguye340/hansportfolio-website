import { motion } from "framer-motion";
import type { ProjectVM } from "../lib/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ items }: { items: ProjectVM[] }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((project, index) => (
        <motion.div
          key={project.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <ProjectCard p={project} />
        </motion.div>
      ))}
    </div>
  );
}
