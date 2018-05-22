const Article = require("../models/Article");

const randomTextSource = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";

const imageURLs = [
    "https://images.pexels.com/photos/594969/pexels-photo-594969.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/1085695/pexels-photo-1085695.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/1081912/pexels-photo-1081912.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/97905/pexels-photo-97905.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/731217/pexels-photo-731217.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/796656/pexels-photo-796656.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350"
];

exports.id = 'RandomArticles7';

exports.up = (done) =>
{
    console.log("[01-Random-Articles.js] Started DBMigration script.");

    for( let i = 0; i < 50; i++ )
    {
        let title, content, modifiedAt, image;

        title = randomText( 5 );
        content = randomText( 20 );
        modifiedAt = randomDate("05/09/2017", "08/20/2020");
        image = randomImage();
        
        let article = new Article({ title, content, modifiedAt, image });

        article.save( err => { 
            if (err) throw new Error("[01-Random-Artiles.js] Unable to save article in database!\n   " + err.message);
            console.log( "[01-Random-Artiles.js] Added random article with title '" + title + "'" );
        });

    }

    done();
};

function randomImage()
{
    let imageURLIndex = Math.floor( Math.random() * imageURLs.length );
    return imageURLs[ imageURLIndex ];
}

function randomText( amountOfWords )
{
    let text = "";
    let randomTextAsArray = randomTextSource.split(" ");    
    let randomWordIndex = Math.floor( Math.random() * randomTextAsArray.length );
    for (let i = randomWordIndex; i < randomTextAsArray.length && i < randomWordIndex + amountOfWords; i++)
    {
        const word = randomTextAsArray[i];
        text += word + " ";
    }
    return text;
}

function randomDate(date1, date2){
    let getRandomArbitrary = (min, max) =>
    {
      return Math.random() * (max - min) + min;
    };
    var date1 = date1 || '01-01-1970';
    var date2 = date2 || new Date().toLocaleDateString();
    date1 = new Date(date1).getTime();
    date2 = new Date(date2).getTime();
    if( date1>date2){
        return new Date(getRandomArbitrary(date2,date1));
    } else{
        return new Date(getRandomArbitrary(date1, date2));
    }
}