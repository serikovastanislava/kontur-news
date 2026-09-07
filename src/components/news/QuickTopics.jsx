import React from 'react';
import { Grid2X2, Flame, Shield, CloudSun, Microscope, 
  BriefcaseBusiness, Heart, Palette } from "lucide-react";
import { topics } from "../../data/news";

const icons = [Grid2X2, Flame, Shield, CloudSun, Microscope, BriefcaseBusiness, Heart, Palette];

export default function QuickTopics() {
  return (
    <section className="topics section">
      <div className="section-head">
        <h2>Быстрый доступ</h2>
        <a>Настроить →</a>
      </div>
      <div className="topic-row">
        {topics.map((t, i) => {
          const Icon = icons[i % icons.length];
          return (
            <button className={i === 0 ? "topic active" : "topic"} key={t}>
              <Icon size={16} />
              <span>{t}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}