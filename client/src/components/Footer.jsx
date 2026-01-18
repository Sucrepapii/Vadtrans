import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white mt-auto">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-raleway font-bold mb-4">Vadtrans</h3>
            <p className="text-neutral-300 text-sm">
              Your trusted transportation booking platform. Travel with ease and
              comfort.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/about"
                  className="text-neutral-300 hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className="text-neutral-300 hover:text-primary transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-neutral-300 hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-neutral-300 hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-neutral-300 hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://web.facebook.com/profile.php?id=61586139616335"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 hover:text-primary transition-colors">
                <FaFacebook size={24} />
              </a>
              <a
                href="https://x.com/VTrans80748?t=xSsQhLMsxZoXPZ895hCU1g&s=09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 hover:text-primary transition-colors">
                <FaXTwitter size={24} />
              </a>
              <a
                href="https://www.instagram.com/vadtransportation/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 hover:text-primary transition-colors">
                <FaInstagram size={24} />
              </a>
              <a
                href="https://wa.me/2349123284931"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 hover:text-green-500 transition-colors">
                <FaWhatsapp size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-6 text-center text-sm text-neutral-400">
          <p>
            &copy; {new Date().getFullYear()} Vadtrans. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
