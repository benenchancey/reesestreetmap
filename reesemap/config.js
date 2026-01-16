var config = {
    style: 'mapbox://styles/benen/cmkg6wlxz00g001rxhrj79frj/draft',
    // leave commented to use Mapbox Standard Style
    accessToken: 'pk.eyJ1IjoiYmVuZW4iLCJhIjoiY2xnMTVlc3dxMDN5ajNkb2ZqNzN3MWpyYSJ9.kqglV5HzmvDmgJF6Gz6S_w',
    showMarkers: false,
    markerColor: '#3FB1CE',
    //projection: 'equirectangular',
    //Read more about available projections here
    //https://docs.mapbox.com/mapbox-gl-js/example/projections/
    inset: true,
    insetOptions: {
        markerColor: 'orange'
    },
    insetPosition: 'bottom-right',
    theme: 'light',
    use3dTerrain: false, //set true for enabling 3D maps.
    auto: false,
    //title: 'A Trip through Reese Street',
    //subtitle: 'Learn more about the historic Reese Street neighborhood through the eyes of one family of educators.',
    //byline: 'By CML',
    footer: 'Source: source citations, etc. <br> Created using <a href="https://github.com/mapbox/storytelling" target="_blank">Mapbox Storytelling</a> template.',
    chapters: [
        {
            id: 'first-chapter',
            alignment: 'center',
            hidden: false,
            title: 'A Trip Through Historic Reese Street, 1851-1956',
            image: '/knox.jpg',
            description: 'The Reese Street neighborhood thrived in the mid-1920s as a cultural hub for Black Athenians, serving as a center of education, business, faith, and community despite ongoing segregation and limited opportunity. Nestled just west of downtown Athens, the historic neighborhood was home to prominent educators, businesspeople, and civic leaders who helped shape the city\'s Black identity and legacy. Home to iconic institutions like Hill First Baptist Church and Athens High & Industrial School, the neighborhood cultivated a strong sense of community, resilience, and achievement. This map will explore the history of Reese Street\'s educational institutions through the lives of three generations of the Jackson-Brydie clan, a family of Black educators with deep roots in the neighborhood.',
            location: {
                center: [-83.38697, 33.95821],
                zoom: 12,
                pitch: 0,
                bearing: 0
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [
                {
                    layer: 'rsboundary',
                    opacity: 0,
                }
            ],
            onChapterExit: [
                {
                     layer: 'rsboundary',
                     opacity: 0.8
                }
            ]
        },
        {
            id: 'second-chapter',
            alignment: 'right',
            hidden: false,
            title: 'The Reese Street Neighborhood',
            //image: './assets/washington-dc.jpg',
            description: 'Reese Street is located just west of downtown Athens. Several Black educational institutions called it home, including the Knox Institute and the Reese Street School, along with other community institutions like the Hill First Baptist Church.',
            location: {
                center: [-83.38339, 33.95787],
                zoom: 16.44,
                pitch: 0,
                bearing: 0,
                // flyTo additional controls-
                // These options control the flight curve, making it move
                // slowly and zoom out almost completely before starting
                // to pan.
                //speed: 2, // make the flying slow
                //curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [{
                    layer: 'rsboundary',
                    opacity: 0.8
                },
                {
                    layer: 'knox',
                    opacity: 1
                },
                {
                    layer: 'rsschool',
                    opacity: 1
                },
                {
                    layer: 'church',
                    opacity: 1
                }
            ],
            onChapterExit: [
                {
                     layer: 'rsboundary',
                     opacity: 0
                },
                {
                    layer: 'knox',
                    opacity: 0
                },
                {
                    layer: 'rsschool',
                    opacity: 0
                },
                {
                    layer: 'church',
                    opacity: 0
                }
            ]
        },
        {
            id: 'third-chapter',
            alignment: 'fully',
            hidden: false,
            title: 'The Jackson-Brydie Family',
            image: '/sisters.jpg',
            description: 'The Jackson-Brydies were a family of educators who lived and worked in Reese Street over the course of about 70 years, from 1886 to around 1956. Not only did they work in Reese Street\'s educational institutions and other schools for Black students around Athens, they also owned several properties within the neighborhood. This story begins with the remarkable lives of three sisters who all became educators and landowners in Athens: Camilla, Mary, and Judia.',
            location: {
                center: [-83.38339, 33.95787],
                zoom: 16.44,
                pitch: 0,
                bearing: 0,
                // flyTo additional controls-
                // These options control the flight curve, making it move
                // slowly and zoom out almost completely before starting
                // to pan.
                //speed: 2, // make the flying slow
                //curve: 1, // change the speed at which it zooms out
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [{
                    layer: 'rsboundary',
                    opacity: 0.8
                }
            ],
            onChapterExit: [
                {
                     layer: 'rsboundary',
                     opacity: 0
                }
            ]
        },
        {
            id: 'fourth-identifier',
            alignment: 'right',
            hidden: false,
            title: 'The Homes on North Finley Street',
            image: '/223north.jpg',
            description: 'These were the properties owned between the sisters in the neighborhood: 223 North Finley (pictured), 249 North Finley, and 193 North Finley. The sisters owned a fourth home at 101 North Finley, which was likely destroyed when Broad Street was widened in 1938.',
            location: {
                center: [-83.38300, 33.95737],
                zoom: 17.78,
                pitch: 43.50,
                bearing: 0
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [{
                    layer: 'rsboundary',
                    opacity: 0.8
                },
                {
                    layer: 'northfinley',
                    opacity: 0.2
                },
                {
                    layer: 'homes',
                    opacity: 1
                }
            ],
            onChapterExit: [
                {
                     layer: 'rsboundary',
                     opacity: 0
                },
                {
                    layer: 'northfinley',
                    opacity: 0
                },
                {
                    layer: 'homes',
                    opacity: 0
                }
            ]
        },
        {
            id: 'fifth-chapter',
            alignment: 'left',
            hidden: false,
            title: 'Camilla Jackson Brydie, 1851-1925',
            image: '/camilla.jpg',
            description: 'Camilla, the eldest of the three Jackson-Brydie sisters, was born in 1851 in the nearby neighborhood of Lickskillet. She was born into slavery, yet still learned to read and write. At the age of 17, she became a teacher at the Knox Institute in Reese Street. She walked between her home in Lickskillet and Reese Street every day, and eventually came to live in the homes that she owned with her sisters on North Finley. On her commute between her then home in Lickskillet and the Knox Institute, she likely would have passed Hot Corner, Athens\'s Black business district, highlighting the interconnectedness of Black communities in Athens. She took on an important role in Reconstruction-era Athens, serving as an educator at a hopeful time for Athens\'s Black residents.',
            location: {
                center: [-83.38359, 33.95850],
                zoom: 15.10,
                pitch: 0.5,
                bearing: -14.40
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [{
                layer: 'ls-hc',
                opacity: 1
            },
            {
                layer: 'rsboundary',
                opacity: 0.8
            }
        ],
            onChapterExit: [{
                layer: 'ls-hc',
                opacity: 0
            },
            {
                layer: 'rsboundary',
                opacity: 0
            }
        ]
        },
        {
            id: 'sixth-identifier',
            alignment: 'left',
            hidden: false,
            title: 'Knox Institute',
            image: '/knox2.jpg',
            description: 'The Knox Institute and Industrial School was founded in 1868 by the Freedmen\'s Bureau at the corner of Reese and Pope streets. Later on, the Knox Institute building would become managed by Athens High and Industrial School (formerly the Reese Street School), which was the first 4-year accredited high school for Black students in the state of Georgia.',
            location: {
                center: [-83.38446, 33.95681],
                zoom: 20.11,
                pitch: 71.63,
                bearing: -73.53
            },
            mapAnimation: 'flyTo',
            rotateAnimation: false,
            callback: '',
            onChapterEnter: [{
                    layer: 'rsboundary',
                    opacity: 0.8
                },
                {
                    layer: 'knox-closeup',
                    opacity: 1
                }
            ],
            onChapterExit: [
                {
                     layer: 'rsboundary',
                     opacity: 0
                },
                {
                    layer: 'knox-closeup',
                    opacity: 0
                }
            ]
        },
          {
            id: 'seventh-chapter',
            alignment: 'right',
            hidden: false,
            title: 'Mary Jackson McCrorey, 1867-1944',
            image: '/mary.jpg',
            description: 'Born in 1867, Mary was the first of the three sisters to be born free. She started teaching in rural schoolhouses around Athens in 1880, at the age of 13 or 14. She would later become the first Black public school principal in Athens.',
            location: {
                center: [-83.37834, 33.96041],
                zoom: 15.2,
                pitch: 1,
                bearing: -14.2
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
          {
            id: 'eighth-chapter',
            alignment: 'right',
            hidden: false,
            title: 'Mary\'s Education at Atlanta University',
            //image: '',
            description: 'Mary was also the first in the family to graduate college. She graduated from Atlanta University in 1886 and, that same year, scored the highest on the teaching exam -- out of both Black AND white test-takers!',
            location: {
                center: [-84.41205, 33.74795],
                zoom: 18.95,
                pitch: 79.27,
                bearing: -100.16
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'ninth-chapter',
            alignment: 'right',
            hidden: false,
            title: 'Mary\'s Reese Street Real Estate Purchases',
            image: '/223north.jpg',
            description: 'Mary also bought the first few of the homes on North Finley, including those at 223 and 101 North Finley. Camilla and her husband Eugene also moved into this house, tying the family even more closely to Reese Street.',
            location: {
            center: [-83.38300, 33.95737],
                zoom: 19,
                pitch: 0,
                bearing: 0
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [{
                layer: 'rsboundary',
                opacity: 0.8
            },
        {
            layer: 'homes',
            opacity: 1
        }],
            onChapterExit: [
                {
                    layer: 'rsboundary',
                    opacity: 0
                },
                {
                    layer: 'homes',
                    opacity: 0
                }
            ]
        },
        {
            id: 'tenth-chapter',
            alignment: 'left',
            hidden: false,
            title: 'Judia Jackson Harris, 1870-1960',
            image: '/judia.jpg',
            description: 'Judia, the youngest of the three sisters, was born in 1870.',
            location: {
                center: [-83.38300, 33.95737],
                zoom: 19,
                pitch: 0,
                bearing: 0
            },
            mapAnimation: 'flyTo',
            rotateAnimation: true,
            callback: '',
            onChapterEnter: [],
            onChapterExit: []
        }
    ]
};
