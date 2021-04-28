# Week 10, Lab 1 — Frontend Frameworks

## Task

Build a static, html+css prototype based on the images in the [screens directory](./screens).
The goal is to create the basic structure of the screen by using the proper components from a
frontend library. For this assignment, you do not need to make the style (color, fonts, etc.) match
the screens exactly.

Below are four frontend frameworks to choose from. Pick whichever looks best to you.
I *heavily* suggest Bootstrap. It has the best documentation, fantastic examples, and wide adoption.
Additionally, this lab uses Bootstrap's naming conventions to describe the elements you should incorporate. It will be easier to follow if you stick with Bootstrap

- [Bootstrap](http://getbootstrap.com)
- [Material Design Lite](https://getmdl.io/)
- [Bulma](https://bulma.io/)

### Required Components

Your prototype must contain all three of the following components:

- Dropdown //done
- Grid/Columns //done
- Modal //done

### Choose Your Own Components

Your prototype should contain your choice of five of the following components.

- Table (Content > Tables) //done
- Input Group (Forms > Input group) //done
- Button Group (Components > Buttons && Forms > Input group > Button addons) //done
- Icons (https://icons.getbootstrap.com/,  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css">) //done
- Floating labels (Forms > Floating labels) //done
- Alert (Components > Alerts) //done
- Tooltip (Components > Tooltips) //done

### Media Queries

One of the greatest challenges to web design and development is that your project needs to look nice
and work on a range of devices of different shapes, sizes, and operating systems. You may have
noticed that sometimes you want your design to look one way on a large screen and another way on a
small smart phone. This issue is addressed by media queries.

At the bottom of your `style.css` file you should see two media queries. Add CSS inside the media
queries that will:

- Make the sidebar slightly smaller and the map slightly larger when the screen width is between
  800px and 480px //done
- Remove the sidebar entirely and have the map take up the full screen when the width is smaller than
  480px //done

