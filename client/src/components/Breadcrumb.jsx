import React from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <FaChevronRight className="text-xs" />}
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-charcoal font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
