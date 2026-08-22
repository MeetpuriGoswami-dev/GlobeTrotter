import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = 'https://qfevnplojsffbdqbdcfh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZXZucGxvanNmZmJkcWJkY2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNjQzMjEsImV4cCI6MjEwMjk0MDMyMX0.sS-AbtgAZquDxGdq69ZyUaABzluviqBzzaxrHR0Bh5k';

const supabase = createClient(url, key);

async function check() {
  console.log("Checking tables...");
  const { data, error } = await supabase.from('cities').select('id').limit(1);
  if (error) {
    console.error("Error connecting or table missing:", error.message);
  } else {
    console.log("Success! 'cities' table exists.");
    const { data: bData, error: bError } = await supabase.storage.getBucket('covers');
    if (bError) {
      console.error("Error checking storage:", bError.message);
    } else {
      console.log("Success! 'covers' bucket exists.");
    }
  }
}
check();
