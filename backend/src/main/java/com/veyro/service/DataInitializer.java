package com.veyro.service;

import com.veyro.entity.*;
import com.veyro.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           AddressRepository addressRepository,
                           CartRepository cartRepository,
                           WishlistRepository wishlistRepository,
                           ReviewRepository reviewRepository,
                           OrderRepository orderRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.addressRepository = addressRepository;
        this.cartRepository = cartRepository;
        this.wishlistRepository = wishlistRepository;
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Initialize Roles
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_CUSTOMER")));
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN")));

        // Initialize Admin User if not exists
        if (!userRepository.existsByEmail("admin@veyro.com")) {
            User admin = new User();
            admin.setEmail("admin@veyro.com");
            admin.setFullName("VEYRO Administrator");
            admin.setPassword(passwordEncoder.encode("Admin@123456!"));
            admin.setActive(true);
            admin.setPhone("+91 9876543210");
            admin.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
            admin.setRoles(new HashSet<>(Arrays.asList(adminRole, customerRole)));
            userRepository.save(admin);
            logger.info("Created default administrator: admin@veyro.com / Admin@123456!");
        }

        // Initialize Demo Customer User if not exists
        User demoCustomer;
        if (!userRepository.existsByEmail("customer@veyro.com")) {
            demoCustomer = new User();
            demoCustomer.setEmail("customer@veyro.com");
            demoCustomer.setFullName("Rahul Sharma");
            demoCustomer.setPassword(passwordEncoder.encode("Customer@123456!"));
            demoCustomer.setActive(true);
            demoCustomer.setPhone("+91 9123456789");
            demoCustomer.setAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150");
            demoCustomer.setRoles(Collections.singleton(customerRole));
            demoCustomer = userRepository.save(demoCustomer);

            // Add persistent cart and wishlist
            cartRepository.save(new Cart(demoCustomer));
            wishlistRepository.save(new Wishlist(demoCustomer));

            // Add demo address
            Address address = new Address();
            address.setUser(demoCustomer);
            address.setRecipientName("Rahul Sharma");
            address.setPhone("+91 9123456789");
            address.setStreetAddress("402, Skyline Residency, 100ft Road");
            address.setApartment("Tower B, Flat 402");
            address.setCity("Bengaluru");
            address.setState("Karnataka");
            address.setPostalCode("560038");
            address.setCountry("India");
            address.setDefaultAddress(true);
            addressRepository.save(address);

            logger.info("Created demo customer: customer@veyro.com / Customer@123456!");
        } else {
            demoCustomer = userRepository.findByEmail("customer@veyro.com").orElse(null);
        }

        // Seed Categories & Products if catalog is empty
        if (categoryRepository.count() == 0) {
            seedCategoriesAndProducts(demoCustomer);
        }
    }

    private void seedCategoriesAndProducts(User customer) {
        logger.info("Seeding realistic categories and product catalog for VEYRO...");

        // Categories
        Category electronics = categoryRepository.save(new Category(
                "Electronics", "electronics", "Laptops, audio, smartphones, monitors and smart home gear",
                "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600", "Laptop"));

        Category fashion = categoryRepository.save(new Category(
                "Fashion", "fashion", "Curated apparel, footwear, and designer luxury wear",
                "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600", "Shirt"));

        Category homeKitchen = categoryRepository.save(new Category(
                "Home & Kitchen", "home-kitchen", "Premium appliances, cookware, and modern interior decor",
                "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600", "Home"));

        Category books = categoryRepository.save(new Category(
                "Books", "books", "Bestsellers, technical guides, literature, and self-growth",
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600", "BookOpen"));

        Category beauty = categoryRepository.save(new Category(
                "Beauty & Personal Care", "beauty-personal-care", "Skincare, fragrance, haircare, and organic essentials",
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600", "Sparkles"));

        Category sports = categoryRepository.save(new Category(
                "Sports & Fitness", "sports-fitness", "Gym equipment, smart wear, outdoor gear, and wellness",
                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600", "Activity"));

        Category accessories = categoryRepository.save(new Category(
                "Accessories", "accessories", "Watches, premium leather goods, eyewear, and travel packs",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600", "Watch"));

        // Helper to add product
        List<Product> products = new ArrayList<>();

        // ELECTRONICS
        products.add(createProduct(
                "VEYRO Sonic Pro ANC Wireless Headphones", "veyro-sonic-pro-anc-headphones",
                "Flagship active noise cancellation headphones with custom 40mm titanium drivers, 45-hour battery life, and spatial audio with dynamic head tracking.",
                "VEYRO Audio", electronics, new BigDecimal("14999.00"), new BigDecimal("11999.00"), 45, true,
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"));

        products.add(createProduct(
                "Aura UltraWide 34-Inch Curved Gaming Monitor", "aura-ultrawide-34-inch-curved-monitor",
                "WQHD 3440x1440 curved IPS display with 165Hz refresh rate, 1ms response time, HDR400, and USB-C 90W power delivery dock.",
                "Aura Vision", electronics, new BigDecimal("42999.00"), new BigDecimal("38499.00"), 20, true,
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
                "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800"));

        products.add(createProduct(
                "KeyChron Craft Mechanical Keyboard RGB", "keychron-craft-mechanical-keyboard",
                "Compact 75% hot-swappable mechanical keyboard featuring Gateron G Pro Brown switches, wireless Bluetooth 5.1, and anodized aluminum body.",
                "KeyChron", electronics, new BigDecimal("8999.00"), new BigDecimal("7499.00"), 60, false,
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
                "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800"));

        products.add(createProduct(
                "Pulse True Wireless Earbuds with Wireless Charging", "pulse-true-wireless-earbuds",
                "Ergonomic in-ear buds with hybrid ANC, quad microphones with AI environmental noise reduction, IPX5 water resistance, and fast Qi charging.",
                "Pulse", electronics, new BigDecimal("4999.00"), new BigDecimal("3699.00"), 120, true,
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
                "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800"));

        // FASHION
        products.add(createProduct(
                "Veloce Merino Wool Minimalist Turtleneck", "veloce-merino-wool-minimalist-turtleneck",
                "Crafted from 100% extra-fine Italian merino wool. Naturally breathable, temperature-regulating, and tailored for a modern slim silhouette.",
                "Veloce", fashion, new BigDecimal("3999.00"), new BigDecimal("2999.00"), 35, true,
                "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800",
                "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800"));

        products.add(createProduct(
                "Urban Edge Tailored Trench Coat Charcoal", "urban-edge-tailored-trench-coat",
                "Double-breasted weatherproof cotton gabardine trench coat with removable storm flap, horn buttons, and timeless charcoal tone.",
                "Urban Edge", fashion, new BigDecimal("8499.00"), null, 18, true,
                "https://images.unsplash.com/photo-1544441893-675973e31985?w=800",
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"));

        products.add(createProduct(
                "Strider Canvas Low-Top Sneakers", "strider-canvas-low-top-sneakers",
                "Eco-conscious vulcanized canvas sneakers with memory foam insole, brass eyelets, and durable natural rubber tread.",
                "Strider", fashion, new BigDecimal("3299.00"), new BigDecimal("2499.00"), 50, false,
                "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800",
                "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800"));

        // HOME & KITCHEN
        products.add(createProduct(
                "Barista Precision Espresso Maker 15-Bar", "barista-precision-espresso-maker",
                "Commercial-grade thermo-block espresso machine with integrated conical burr grinder, digital PID temperature control, and microfoam steam wand.",
                "Barista Master", homeKitchen, new BigDecimal("26999.00"), new BigDecimal("22499.00"), 15, true,
                "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800",
                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800"));

        products.add(createProduct(
                "Nordic Minimalist Cast Iron Dutch Oven 5.5Qt", "nordic-minimalist-cast-iron-dutch-oven",
                "Heavy-duty enameled cast iron delivering superior heat retention and distribution. Oven-safe up to 500°F with stainless steel knob.",
                "Nordic Cookware", homeKitchen, new BigDecimal("5499.00"), new BigDecimal("4499.00"), 25, false,
                "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800",
                "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800"));

        products.add(createProduct(
                "Smart Aroma Ultrasonic Humidifier with LED Glow", "smart-aroma-ultrasonic-humidifier",
                "Whisper-quiet 4L ultrasonic cool mist humidifier with built-in essential oil diffuser, app control, and ambient night light.",
                "AromaPure", homeKitchen, new BigDecimal("3499.00"), new BigDecimal("2699.00"), 80, true,
                "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800",
                "https://images.unsplash.com/photo-1608248597359-528892d713c7?w=800"));

        // BOOKS
        products.add(createProduct(
                "Designing Data-Intensive Applications", "designing-data-intensive-applications",
                "The definitive guide to the principles, algorithms, and practical trade-offs for reliable, scalable, and maintainable systems by Martin Kleppmann.",
                "O'Reilly Media", books, new BigDecimal("1899.00"), new BigDecimal("1499.00"), 100, true,
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"));

        products.add(createProduct(
                "Atomic Habits: Proven Framework for Better Systems", "atomic-habits-james-clear",
                "James Clear's internationally celebrated book on using minuscule changes to trigger remarkable and permanent personal results.",
                "Penguin Random House", books, new BigDecimal("799.00"), new BigDecimal("499.00"), 150, true,
                "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800",
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800"));

        // BEAUTY & PERSONAL CARE
        products.add(createProduct(
                "Botanical Radiance Vitamin C + E Ferulic Serum", "botanical-radiance-vitamin-c-serum",
                "Clinical antioxidant daily serum designed to boost luminosity, protect from environmental stressors, and firm texture.",
                "Lumière Organics", beauty, new BigDecimal("1999.00"), new BigDecimal("1499.00"), 90, true,
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
                "https://images.unsplash.com/photo-1608248597359-528892d713c7?w=800"));

        products.add(createProduct(
                "Oud Imperial Eau De Parfum 100ml", "oud-imperial-eau-de-parfum",
                "Smoky agarwood, damask rose, amber, and spiced cardamom handcrafted into a long-lasting, sophisticated unisex fragrance.",
                "Maison Veyro", beauty, new BigDecimal("4999.00"), new BigDecimal("3999.00"), 40, true,
                "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
                "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800"));

        // SPORTS & FITNESS
        products.add(createProduct(
                "Apex Pro Smart Fitness Tracker & Heart Rate Watch", "apex-pro-smart-fitness-tracker",
                "All-day health tracking with continuous PPG heart rate sensor, SpO2, sleep stages, built-in GPS, and 14-day battery life.",
                "Apex Gear", sports, new BigDecimal("6999.00"), new BigDecimal("5499.00"), 55, true,
                "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800",
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"));

        products.add(createProduct(
                "EcoGrip High-Density Non-Slip Yoga Mat 6mm", "ecogrip-high-density-yoga-mat",
                "Biodegradable natural tree rubber with alignment guides, antimicrobial surface, and carry strap.",
                "Zenith Life", sports, new BigDecimal("2499.00"), new BigDecimal("1899.00"), 70, false,
                "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
                "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800"));

        // ACCESSORIES
        products.add(createProduct(
                "Chronos Sapphire Automatic Mechanical Watch", "chronos-sapphire-automatic-watch",
                "Exquisite skeleton case-back with Japanese Miyota automatic movement, scratch-resistant sapphire crystal, and genuine Italian leather strap.",
                "Chronos", accessories, new BigDecimal("18999.00"), new BigDecimal("15499.00"), 22, true,
                "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800",
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800"));

        products.add(createProduct(
                "Voyager Waterproof Roll-Top Commuter Backpack", "voyager-waterproof-commuter-backpack",
                "Weatherproof Cordura 500D fabric, magnetic Fidlock buckle, padded 16-inch laptop compartment, and ergonomic airflow back panel.",
                "Voyager Labs", accessories, new BigDecimal("5999.00"), new BigDecimal("4499.00"), 65, true,
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
                "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800"));

        products.add(createProduct(
                "Polarized Aviator Classic Sunglasses UV400", "polarized-aviator-sunglasses",
                "Titanium alloy frame with glare-reducing polarized lenses, adjustable silicone nose pads, and protective leather case.",
                "Solaris", accessories, new BigDecimal("2999.00"), new BigDecimal("2199.00"), 85, false,
                "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
                "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800"));

        // Add sample reviews
        if (customer != null && !products.isEmpty()) {
            Product headphone = products.get(0);
            Review review1 = new Review(
                    headphone, customer, 5, "Unbelievable sound clarity and noise cancelling!",
                    "These headphones completely blocked the airplane engine sound on my flight. The spatial audio feature makes movies feel like a cinema experience.",
                    true);
            reviewRepository.save(review1);
            headphone.setRating(BigDecimal.valueOf(5.0));
            headphone.setReviewCount(1);
            productRepository.save(headphone);

            if (products.size() > 1) {
                Product monitor = products.get(1);
                Review review2 = new Review(
                        monitor, customer, 5, "Stunning colors and productivity game changer",
                        "The 34-inch ultrawide replaces two separate monitors seamlessly. USB-C 90W charges my laptop with a single clean cable.",
                        true);
                reviewRepository.save(review2);
                monitor.setRating(BigDecimal.valueOf(5.0));
                monitor.setReviewCount(1);
                productRepository.save(monitor);
            }
        }

        logger.info("Catalog seeding completed: {} products added.", products.size());
    }

    private Product createProduct(String name, String slug, String description, String brand,
                                  Category category, BigDecimal price, BigDecimal salePrice,
                                  int stock, boolean featured, String... images) {
        Product p = new Product();
        p.setName(name);
        p.setSlug(slug);
        p.setDescription(description);
        p.setBrand(brand);
        p.setCategory(category);
        p.setPrice(price);
        p.setSalePrice(salePrice);
        p.setStockQuantity(stock);
        p.setActive(true);
        p.setFeatured(featured);
        p.setRating(BigDecimal.valueOf(4.5 + (Math.random() * 0.5)).setScale(1, java.math.RoundingMode.HALF_UP));
        p.setReviewCount(12 + (int)(Math.random() * 45));

        Product saved = productRepository.save(p);

        for (int i = 0; i < images.length; i++) {
            ProductImage img = new ProductImage(images[i], i == 0, i);
            saved.addImage(img);
        }

        return productRepository.save(saved);
    }
}
