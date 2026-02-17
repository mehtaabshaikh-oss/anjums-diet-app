#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseKey ? 'exists' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testClients = [
  {
    name: 'Raj Kumar',
    email: 'raj.kumar@test.com',
    phone: '9876543210',
    package: 'Gold',
    duration_months: 3,
    status: 'active',
    start_date: '2025-02-01',
    end_date: '2025-05-01',
    next_appointment_date: '2025-02-20',
    profile: {
      age: 28,
      gender: 'Male',
      height_cm: 175,
      weight_kg: 85,
      target_weight_kg: 75,
      allergies: 'Peanuts',
      medical_conditions: 'None',
      dietary_preference: 'Vegetarian',
    },
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@test.com',
    phone: '9765432109',
    package: 'Platinum',
    duration_months: 6,
    status: 'active',
    start_date: '2025-01-15',
    end_date: '2025-07-15',
    next_appointment_date: '2025-02-18',
    profile: {
      age: 32,
      gender: 'Female',
      height_cm: 162,
      weight_kg: 72,
      target_weight_kg: 60,
      allergies: 'Dairy',
      medical_conditions: 'PCOS',
      dietary_preference: 'Non-Vegetarian',
    },
  },
  {
    name: 'Arjun Singh',
    email: 'arjun.singh@test.com',
    phone: '9654321098',
    package: 'Silver',
    duration_months: 2,
    status: 'active',
    start_date: '2025-02-10',
    end_date: '2025-04-10',
    next_appointment_date: '2025-02-25',
    profile: {
      age: 25,
      gender: 'Male',
      height_cm: 182,
      weight_kg: 92,
      target_weight_kg: 80,
      allergies: 'None',
      medical_conditions: 'Thyroid',
      dietary_preference: 'Non-Vegetarian',
    },
  },
  {
    name: 'Neha Sharma',
    email: 'neha.sharma@test.com',
    phone: '9543210987',
    package: 'Gold',
    duration_months: 4,
    status: 'paused',
    start_date: '2024-12-01',
    end_date: '2025-04-01',
    next_appointment_date: null,
    profile: {
      age: 29,
      gender: 'Female',
      height_cm: 165,
      weight_kg: 68,
      target_weight_kg: 58,
      allergies: 'Shellfish',
      medical_conditions: 'Diabetes',
      dietary_preference: 'Vegetarian',
    },
  },
  {
    name: 'Vikram Desai',
    email: 'vikram.desai@test.com',
    phone: '9432109876',
    package: 'Platinum',
    duration_months: 12,
    status: 'completed',
    start_date: '2024-02-01',
    end_date: '2025-02-01',
    next_appointment_date: null,
    profile: {
      age: 35,
      gender: 'Male',
      height_cm: 178,
      weight_kg: 78,
      target_weight_kg: 70,
      allergies: 'None',
      medical_conditions: 'None',
      dietary_preference: 'Non-Vegetarian',
    },
  },
  {
    name: 'Simran Kaur',
    email: 'simran.kaur@test.com',
    phone: '9321098765',
    package: 'Silver',
    duration_months: 3,
    status: 'active',
    start_date: '2025-01-20',
    end_date: '2025-04-20',
    next_appointment_date: '2025-02-22',
    profile: {
      age: 27,
      gender: 'Female',
      height_cm: 158,
      weight_kg: 65,
      target_weight_kg: 55,
      allergies: 'Gluten',
      medical_conditions: 'None',
      dietary_preference: 'Vegetarian',
    },
  },
  {
    name: 'Aditya Nair',
    email: 'aditya.nair@test.com',
    phone: '9210987654',
    package: 'Gold',
    duration_months: 5,
    status: 'inactive',
    start_date: '2024-11-01',
    end_date: '2025-04-01',
    next_appointment_date: null,
    profile: {
      age: 31,
      gender: 'Male',
      height_cm: 180,
      weight_kg: 88,
      target_weight_kg: 76,
      allergies: 'Eggs',
      medical_conditions: 'High BP',
      dietary_preference: 'Non-Vegetarian',
    },
  },
];

async function seedData() {
  try {
    console.log('🌱 Starting data seeding...\n');

    for (const client of testClients) {
      // Hash password
      const tempPassword = Math.random().toString(36).slice(-12);
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Insert client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: client.name,
          email: client.email,
          phone: client.phone,
          package: client.package,
          duration_months: client.duration_months,
          status: client.status,
          start_date: client.start_date,
          end_date: client.end_date,
          next_appointment_date: client.next_appointment_date,
          password_hash: passwordHash,
        })
        .select();

      if (clientError) {
        console.error(`✗ Error creating client ${client.name}:`, clientError);
        continue;
      }

      const clientId = clientData[0].id;
      console.log(`✓ ${client.name} (${client.email})`);
      console.log(`  Password: ${tempPassword}`);
      console.log(`  Package: ${client.package} | Status: ${client.status}`);

      // Insert profile
      const { error: profileError } = await supabase
        .from('client_profiles')
        .insert({
          client_id: clientId,
          age: client.profile.age,
          gender: client.profile.gender,
          height_cm: client.profile.height_cm,
          weight_kg: client.profile.weight_kg,
          target_weight_kg: client.profile.target_weight_kg,
          allergies: client.profile.allergies,
          medical_conditions: client.profile.medical_conditions,
          dietary_preference: client.profile.dietary_preference,
        });

      if (profileError) {
        console.error(`  ✗ Profile error:`, profileError);
      } else {
        console.log(`  ✓ Profile created`);
      }

      // Add weight logs for active clients
      if (client.status === 'active' || client.status === 'completed') {
        const today = new Date();
        const weightLogs = [
          {
            client_id: clientId,
            logged_date: new Date(new Date(today).setDate(today.getDate() - 20)).toISOString().split('T')[0],
            weight_kg: client.profile.weight_kg,
            notes: 'Initial weight',
          },
          {
            client_id: clientId,
            logged_date: new Date(new Date(today).setDate(today.getDate() - 10)).toISOString().split('T')[0],
            weight_kg: client.profile.weight_kg - 2,
            notes: 'Progress check',
          },
          {
            client_id: clientId,
            logged_date: new Date(today).toISOString().split('T')[0],
            weight_kg: client.profile.weight_kg - 3,
            notes: 'Latest weight',
          },
        ];

        for (const log of weightLogs) {
          const { error: logError } = await supabase
            .from('weight_logs')
            .insert(log);

          if (logError) {
            console.error(`  ✗ Weight log error:`, logError);
          }
        }
        console.log(`  ✓ Added 3 weight logs`);
      }
      console.log();
    }

    console.log('\n✅ Data seeding completed!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

seedData();
