import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import "./Products.scss";

const allProducts = JSON.parse(document.getElementById("products").innerText);
const apikey = document.getElementById("apikey").innerText;
console.log(allProducts);

function Product({ id, name, price, description, sale, discount, image }) {
  const hasDiscount = discount > 0 ? true : false;
  const finalPrice = Math.round(((100 - discount) / 100) * price);

  const loadedImage = useRef(null);
  const [exColor, setExColor] = useState("rgb(0,0,0)");
  const [isLoaded, setIsLoaded] = useState(false);
  const [colorPalette, setColorPalette] = useState({});
  const [isHovered, setHovered] = useState(false);

  return (
    <div
      className={`product default ${isHovered ? "hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="product-name" style={isHovered ? colorPalette : {}}>
        {name}.
      </div>
      <div
        className="product-image"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className={`product-image-overlay ${isLoaded ? "active" : ""}`}>
          <span>loading..</span>
        </div>
        {sale ? <span className="product-sale">Sale.</span> : ""}
        <img
          src={image}
          alt="Product Image"
          ref={loadedImage}
          onLoad={() => {
            const colorThief = new ColorThief();
            var color = colorThief.getColor(loadedImage.current);
            const palette = colorThief.getPalette(loadedImage.current);

            // Generate Pallette
            let middle = "",
              start = 10,
              interval = 50;
            palette.forEach((pal, index) => {
              middle += `, rgb(${pal[0]},${pal[1]},${pal[2]}) ${
                start + index * interval
              }px ${start + index * interval + interval}px`;
            });
            let final = `{"backgroundImage": "repeating-linear-gradient(-45deg ${middle} )"}`;
            setColorPalette(JSON.parse(final));

            var color = palette[1];
            const rgbColor = `rgb(${color[0]},${color[1]},${color[2]})`;
            setExColor(rgbColor);
            setIsLoaded(true);
          }}
          style={{ display: "none" }}
          crossOrigin="anonymous"
        />
      </div>
      <div className="product-details">
        <p className="product-description">{description}</p>
        {hasDiscount ? (
          <p className="product-original">
            <span>${price}</span> - {discount}% discount
          </p>
        ) : (
          <p
            className="product-original"
            style={{ opacity: 0, userSelect: "none" }}
          >
            hidden
          </p>
        )}
        <p className="product-price">${finalPrice}</p>
        <svg
          className="cart-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ backgroundColor: exColor }}
        >
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      </div>
    </div>
  );
}

function Products() {
  return (
    <div className="products-container">
      <div className="products">
        {allProducts.map((prod) => (
          <Product {...prod} key={prod.id} />
        ))}
      </div>
      {allProducts.length === 0 ? <Empty /> : ""}
    </div>
  );
}

function Empty() {
  return (
    <div className="product-empty">
      <p>No products added yet!</p>
      <a href={`/api-docs/${apikey}`} target="_blank">
        Add some
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
    </div>
  );
}

function Jumbotron() {
  return (
    <div className="jumbotron">
      <h1>Products.</h1>
      <p>
        Made with love.{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ verticalAlign: "middle" }}
        >
          <path
            fill="#F24236"
            stroke="#F24236"
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          ></path>
        </svg>
      </p>
    </div>
  );
}

function Footer() {
  return <div style={{ marginTop: 70 }}></div>;
}

ReactDOM.render(
  <div className="App">
    <Jumbotron />
    <Products />
    <Footer />
  </div>,
  document.getElementById("root")
);
