Below is the prompt I used to generate the Design System for Atlas through Claude Design. There are web and mobile UI kits, as well as a marketing/landing page.

I want you to write an in-depth plan, split into manageable sized prompts for a Claude Pro plan, to implement this SaaS. For a technology stack, reference ../playloop, this is another SaaS we developed together recently deployed into AWS using SST, with a low cost Cloudfront/S3/API Gateway/Lambda architecture and a PostgreSQL backend. I am assuming PostgreSQL again because we will be wanting to use geospatial data for imports and displaying on maps, so likely PostGIS is needed, but I will take your steer on this. The maps should be interactive, zoomable, pannable, should be able to click on my trails and peaks to learn more about them.

Read the below carefully, read my design system carefully, and then create my detailed plan in a plan.md file to be

## Product Overview

Atlas is a completionist platform for outdoor exploration.

Users connect Strava, Garmin, Komoot, AllTrails, GPX files, and other activity sources. Atlas imports historical activities and automatically builds a lifetime record of everything they have explored.

Atlas does NOT do route planning.

Atlas does NOT do navigation.

Atlas does NOT record activities.

Atlas sits on top of existing outdoor platforms and transforms activity history into collections, achievements, exploration progress, and long-term goals.

Think:

* Letterboxd for outdoor adventures
* Steam achievements for hiking
* A Pokédex for trails, peaks, regions and landmarks

The emotional goal is to create a strong sense of progress, collection, discovery and completion.

---

## Core Value Proposition

A user connects their accounts and instantly discovers:

* Which peaks they have climbed
* Which trails they have completed
* Which trail networks they have partially explored
* Which regions they have explored
* Which landmarks they have visited
* Which achievements they have unlocked

The product should make users want to go outside specifically to complete collections and fill gaps.

---

## Core Objects

### Peaks

Examples:

* Munros
* Wainwrights
* County Tops
* National Park High Points
* Global Mountain Lists

Users see progress against collections.

Examples:

* 43 / 282 Munros
* 121 / 214 Wainwrights

---

### Trails

Examples:

* Pennine Way
* South West Coast Path
* Appalachian Trail
* National Trails

Users can complete trails in sections over time.

Examples:

* 64% completed
* 12 sections remaining

---

### Regions

Examples:

* Lake District
* Snowdonia
* Peak District
* National Parks
* Mountain Ranges

Users see exploration coverage percentages.

Examples:

* Lake District: 68%
* Snowdonia: 42%

---

### Landmarks

Examples:

* Trig points
* Waterfalls
* Bothies
* Shelters
* Viewpoints
* Mountain huts

Users collect them similarly to achievements.

---

### Achievements

Examples:

* First 1000m summit
* Three 800m summits in one day
* Complete a National Trail
* Visit 100 unique summits
* Hike 50km in a day
* Explore 90% of a region

Achievements have:

* Bronze
* Silver
* Gold

Achievements award points.

---

### Outdoor Score

Points contribute to:

* User level
* Outdoor score
* Lifetime profile progression

This should feel similar to Xbox Gamerscore or Steam achievements.

---

## Platform Experience

### Mobile App

Primary purpose:

* Checking progress
* Viewing achievements
* Viewing collections
* Discovering what remains to complete

Main navigation:

* Home
* Explore Map
* Collections
* Achievements
* Profile

---

### Web App

Primary purpose:

* Deep analysis
* Large interactive maps
* Collection management
* Exploration statistics
* Progress planning

The web experience should feel like a power-user dashboard.

---

## Design Direction

The product should feel:

* Premium
* Motivating
* Data-rich
* Exploration-focused
* Modern
* Clean
* Aspirational

Avoid:

* Looking like a fitness tracker
* Looking like Strava
* Looking like AllTrails
* Looking like a route-planning app

Instead take inspiration from:

* Letterboxd
* Steam
* Duolingo progression systems
* GitHub contribution heatmaps
* Modern gaming achievement systems

---

## Screens To Design

Create high-fidelity concepts for:

### 1. Home Dashboard

Show:

* Exploration progress
* Recent achievements
* Collection progress
* Outdoor score
* Suggested next goals

This should immediately communicate the product's value.

---

### 2. Exploration Map

Show:

* Completed trails
* Explored paths
* Collected peaks
* Unexplored gaps

This should be the emotional centrepiece of the product.

---

### 3. Collection Detail

Example:

"Wainwrights"

Show:

* Completion percentage
* Completed items
* Remaining items
* Progress visualisations

Should feel collectible and satisfying.

---

### 4. Achievement Gallery

Steam/Xbox style achievement showcase.

Show:

* Locked achievements
* Unlocked achievements
* Progress towards next unlock
* Bronze/Silver/Gold tiers

---

### 5. Region Progress Page

Example:

"Lake District"

Show:

* Exploration percentage
* Trails completed
* Peaks completed
* Landmarks collected
* Missing opportunities nearby

---

Focus heavily on the psychology of collection, progress, completion and achievement. The product should make users feel proud of their outdoor history and excited to complete what remains.
