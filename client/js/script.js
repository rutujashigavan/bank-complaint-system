document.addEventListener("DOMContentLoaded", () => {

    // ================= SIDE MENU =================
    const menuBtn = document.getElementById("menuBtn");
    const sideMenu = document.getElementById("sideMenu");

    if (menuBtn && sideMenu) {

        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            sideMenu.classList.toggle("active");
        });

        sideMenu.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        document.addEventListener("click", () => {
            sideMenu.classList.remove("active");
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                sideMenu.classList.remove("active");
            }
        });
    }

    // ================= MODAL SYSTEM =================
    const aboutModal = document.getElementById("aboutModal");
    const helpModal = document.getElementById("helpModal");

    const aboutLink = document.getElementById("aboutLink");
    

    function openAboutModal() {
        if (aboutModal) {
            aboutModal.classList.add("active");
        }
    }

    function closeAboutModal() {
        if (aboutModal) {
            aboutModal.classList.remove("active");
        }
    }

    function openHelpModal() {
        if (helpModal) {
            helpModal.classList.add("active");
        }
    }

    function closeHelpModal() {
        if (helpModal) {
            helpModal.classList.remove("active");
        }
    }

    // ================= ABOUT LINK =================
    if (aboutLink) {
        aboutLink.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            openAboutModal();

            if (sideMenu) {
                sideMenu.classList.remove("active");
            }
        });
    }

    // ================= HELP LINK =================
    // ================= HELP LINKS =================
document.querySelectorAll(".helpPopupLink").forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        openHelpModal();

        if (sideMenu) {
            sideMenu.classList.remove("active");
        }
    });
}); 

    // ================= HELP DROPDOWNS =================

    // Category dropdown
    document.querySelectorAll(".help-category-title").forEach((categoryTitle) => {
        categoryTitle.addEventListener("click", () => {

            const category = categoryTitle.parentElement;

            document.querySelectorAll(".help-category").forEach((item) => {
                if (item !== category) {
                    item.classList.remove("active");
                }
            });

            category.classList.toggle("active");
        });
    });

    // Question dropdown
    document.querySelectorAll(".question").forEach((question) => {
        question.addEventListener("click", () => {

            const faq = question.parentElement;
            const categoryBody = question.closest(".help-category-body");

            if (categoryBody) {
                categoryBody.querySelectorAll(".faq").forEach((item) => {
                    if (item !== faq) {
                        item.classList.remove("active");
                    }
                });
            }

            faq.classList.toggle("active");
        });
    });

    // ================= CLOSE MODALS ON OUTSIDE CLICK =================
    document.addEventListener("click", (e) => {

        if (aboutModal && aboutModal.classList.contains("active")) {
            const aboutBox = aboutModal.querySelector(".modal-box");

            if (aboutBox && !aboutBox.contains(e.target)) {
                closeAboutModal();
            }
        }

        if (helpModal && helpModal.classList.contains("active")) {
            const helpBox = helpModal.querySelector(".modal-box");

            if (helpBox && !helpBox.contains(e.target)) {
                closeHelpModal();
            }
        }
    });

    // ================= ESC CLOSE =================
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeAboutModal();
            closeHelpModal();

            if (sideMenu) {
                sideMenu.classList.remove("active");
            }
        }
    });

    // ================= GLOBAL FUNCTIONS FOR X BUTTON =================
    window.closeModal = closeAboutModal;
    window.closeHelpModal = closeHelpModal;

});