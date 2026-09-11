import { useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";


function RoleCarousel({
  roles,
  selectedRole,
  onSelect,
}) {
  const carouselRef = useRef(null);


  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: -360,
        behavior: "smooth",
      });
    }
  };


  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: 360,
        behavior: "smooth",
      });
    }
  };


  return (
    <div className="role-carousel-wrapper">

      {/* Left Button */}

      <button
        type="button"
        className="carousel-arrow carousel-arrow-left"
        onClick={scrollLeft}
        aria-label="Previous roles"
      >
        <ChevronLeft size={22} />
      </button>


      {/* Cards Container */}

      <div
        className="role-carousel"
        ref={carouselRef}
      >

        {roles.map((role) => {

          const isSelected =
            selectedRole?.id === role.id;


          return (
            <div
              key={role.id}
              className={`role-card ${
                isSelected
                  ? "role-card-selected"
                  : ""
              }`}
              onClick={() => onSelect(role)}
            >

              {/* Card Top */}

              <div className="role-card-top">

                <div className="role-card-number">
                  {String(role.id).padStart(2, "0")}
                </div>


                {isSelected && (
                  <div className="role-selected-badge">
                    Selected
                  </div>
                )}

              </div>


              {/* Icon */}

              <div className="role-card-icon">
                <ShieldCheck size={28} />
              </div>


              {/* Role Name */}

              <h3>
                {role.name}
              </h3>


              {/* Category */}

              <span className="role-category">
                {role.category}
              </span>


              {/* Description */}

              <p>
                {role.description}
              </p>


              {/* Permissions */}

              <div className="role-permissions">

                <span className="permission-title">
                  Access
                </span>


                <div className="permission-list">

                  {role.permissions.map(
                    (permission) => (
                      <span
                        key={permission}
                        className="permission-tag"
                      >
                        {permission}
                      </span>
                    )
                  )}

                </div>

              </div>


              {/* Select Button */}

              <button
                type="button"
                className={`role-select-button ${
                  isSelected
                    ? "selected"
                    : ""
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(role);
                }}
              >
                {isSelected
                  ? "Selected"
                  : "Select Role"}
              </button>

            </div>
          );
        })}

      </div>


      {/* Right Button */}

      <button
        type="button"
        className="carousel-arrow carousel-arrow-right"
        onClick={scrollRight}
        aria-label="Next roles"
      >
        <ChevronRight size={22} />
      </button>

    </div>
  );
}


export default RoleCarousel;