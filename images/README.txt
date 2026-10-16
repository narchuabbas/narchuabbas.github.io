OCEAN ARCHITECTS — HOW THE SITE WORKS
=====================================

LOGO
----
The site uses  logo2.png  (in the main website folder) as the logo.
To change it, replace that file or edit the <img src="logo2.png"> in each .html page.

HERO IMAGE (home page background)
---------------------------------
Set in index.html near the top:  .hero { --hero-img: url('20m Yacht/prespective render.png'); }
Change the path to any image you like.

PROJECTS  (this is the important one)
-------------------------------------
Every project is one entry in the file:  js/projects-data.js
Each project points to a folder and lists the image files inside it.
The FIRST image in each list is used as the cover; the rest form the gallery.
Videos (.mp4) are shown under the gallery.

To EDIT a project  -> open js/projects-data.js and change its title, category,
                      blurb, length, or the list of image file names.
To ADD a project   -> create a new folder with images, then copy one { ... } block
                      in projects-data.js and update dir + images.
To REMOVE a project -> delete its { ... } block.

The home-page swipe carousel and the Projects page are BOTH built automatically
from this one file, so you only edit it in one place.

Currently included (14 projects): Inshore 385 CC, Offshore 46, Bertram 31 Flybridge,
Harpoon Catamaran, 50 ft Catamaran, 20m Yacht, Yacht Hardtop Design, Sailing Boat,
2.5m USV, Jackup Barge, Dredger, Floating Sauna, Playground Wooden Boat,
Axopar 45 XC (3D printable).

CONTACT FORM
------------
The form on contact.html opens the visitor's email app with a message already
addressed to aon@oceanarchs.com (Name / Email / Message filled in).

Want messages to arrive in your inbox WITHOUT opening an email app?
1. Create a free account at formspree.io and make a new form -> you get an ID
   like  xayzabcd.
2. In contact.html, replace the <form id="contact-form" novalidate> tag with:
      <form action="https://formspree.io/f/YOURID" method="POST">
   and add   name="name"  name="email"  name="message"  (already present).
3. Remove the js hook if you like — Formspree will email you every submission.

TIP: keep images under ~500 KB each so pages load fast.
