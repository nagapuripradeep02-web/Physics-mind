import { createClient } from '@supabase/supabase-js';
import { VERIFIED_CONCEPTS } from '../data/verified-concepts-seed';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedConcepts() {
    console.log(`Seeding ${VERIFIED_CONCEPTS.length} concepts...`);

    for (const concept of VERIFIED_CONCEPTS) {
        const { error } = await supabase
            .from('verified_concepts')
            .upsert(concept, { onConflict: 'concept_slug' });

        if (error) {
            console.error(`✗ Failed: ${concept.concept_slug}`, error.message);
        } else {
            console.log(`✓ ${concept.concept_name}`);
        }
    }

    console.log('\nSeeding complete. Check Supabase verified_concepts table.');
}

seedConcepts().catch(console.error);
