"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function ProductTour() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const hasSeenTour = localStorage.getItem("veda_tour_seen");
    if (!hasSeenTour) {
      setTimeout(() => {
        const driverObj = driver({
          showProgress: true,
          allowClose: true,
          overlayColor: "rgba(0, 0, 0, 0.5)",
          steps: [
            {
              element: "#tour-assignments-menu",
              popover: {
                title: "Assignments Menu",
                description:
                  "Welcome to VedaAI! Here you can view and manage all your generated assignment papers.",
                side: "right",
                align: "start",
              },
            },
            {
              element: "#tour-create-assignment",
              popover: {
                title: "Create Assignment",
                description: "Click this button to start crafting a brand new assignment.",
                side: "right",
                align: "start",
              },
            },
            {
              element: "#tour-settings-btn",
              popover: {
                title: "Configure LLM Settings",
                description:
                  "Important: Before creating an assignment, click here to configure your Gemini API Key and select your preferred model.",
                side: "right",
                align: "start",
              },
            },
          ],
          onDestroyStarted: () => {
            localStorage.setItem("veda_tour_seen", "true");
            driverObj.destroy();
          },
        });

        driverObj.drive();
      }, 1000);
    }
  }, [mounted]);

  return null;
}
