require('dotenv').config();
const mongoose = require('mongoose');
const Author = require('../models/Author');
const Post = require('../models/Post');
const connectDB = require('../config/database');

const initializeDB = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Create sample author
        const author = await Author.create({
            name: 'John Doe',
            email: 'john.doe@konnectafrica.com',
            bio: 'Environmental Sustainability Expert at Konnect Africa',
            avatar: 'author1.jpg',
            role: 'Senior Consultant',
            socialLinks: {
                twitter: 'https://twitter.com/johndoe',
                linkedin: 'https://linkedin.com/in/johndoe',
                facebook: 'https://facebook.com/johndoe'
            }
        });

        // Create sample blog post
        await Post.create({
            title: 'From Trash to Treasure: Revolutionizing Glass Bottle Recycling in Africa',
            content: `
                <p>At Konnect Africa, we're proud to introduce our groundbreaking initiative that's transforming waste glass bottles into valuable products while creating sustainable employment opportunities across the continent.</p>
                
                <h2>The Challenge</h2>
                <p>Africa faces significant challenges in waste management, particularly with glass bottles. Many communities lack proper recycling facilities, leading to environmental hazards and missed economic opportunities.</p>
                
                <h2>Our Solution</h2>
                <p>Through our "Trash to Treasure" project, we've developed innovative techniques to:</p>
                <ul>
                    <li>Convert waste glass bottles into decorative items</li>
                    <li>Create building materials from recycled glass</li>
                    <li>Establish community recycling centers</li>
                    <li>Train local artisans in glass upcycling</li>
                </ul>
                
                <h2>Impact</h2>
                <p>Since launching the initiative, we have:</p>
                <ul>
                    <li>Recycled over 100,000 glass bottles</li>
                    <li>Created employment for 50+ community members</li>
                    <li>Reduced landfill waste by 30% in participating communities</li>
                    <li>Generated sustainable income for local families</li>
                </ul>
            `,
            excerpt: 'Discover how our innovative recycling initiative is transforming waste glass bottles into valuable products while creating sustainable employment opportunities.',
            author: author._id,
            category: 'sustainability',
            image: 'trash-to-treasure.jpg',
            featured: true,
            status: 'published'
        });

        console.log('Database initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
};

initializeDB(); 